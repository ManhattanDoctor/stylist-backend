import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper, ValidateUtil, DateUtil, Transport } from '@ts-core/common';
import { TgUser } from '@ts-core/oauth';
import { map, filter, takeUntil } from 'rxjs';
import { InlineKeyboardButton, EditMessageTextOptions, FileOptions, SendPhotoOptions, SendMessageOptions, SuccessfulPayment, PreCheckoutQuery, Message, ChatId, CallbackQuery } from 'node-telegram-bot-api';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import { UserAccountEntity, UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { DatabaseService } from '@project/module/database/service';
import { LoginUtil } from '@project/common/login';
import { UserAccountType, UserResource, UserStatus } from '@project/common/user';
import { UserUtil } from '@project/common/util';
import { ProjectName } from '@project/common';
import { AiMeanCommand, AiMeanedEvent, AiMeanedErrorEvent, IAiMeanedDto, IAiMeanedErrorDto } from '@project/module/ai/transport';
import { Stream } from "stream";
import { CoinId } from '@project/common/coin';
import { PaymentEntity, PaymentTransactionEntity } from '@project/module/database/payment';
import { PaymentAggregatorType, PaymentStatus, PaymentTransactionType } from '@project/common/payment';
import { PaymentSucceedEvent } from '@project/module/payment/transport';
import { ErrorCode } from '@project/common/api';
import { MeaningAccountEntity } from '@project/module/database/meaning';
import { LanguageProjects, LanguageProjectProxy } from '@ts-core/language';
import { PaymentService } from '@project/module/payment/service';
import * as Bot from 'node-telegram-bot-api';
import * as _ from 'lodash';

@Injectable()
export class TelegramBotService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private _bot: Bot;
    private language: LanguageProjectProxy;
    private progress: Map<number, ILock>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private settings: ITelegramBotSettings, language: LanguageProjects) {
        super(logger);

        this.progress = new Map();
        this.language = new LanguageProjectProxy(settings.project, language);

        transport.getDispatcher<AiMeanedEvent>(AiMeanedEvent.NAME).pipe(map(event => event.data), filter(this.aiMeanedFilter), takeUntil(this.destroyed)).subscribe(this.aiMeanedHandler);
        transport.getDispatcher<AiMeanedErrorEvent>(AiMeanedErrorEvent.NAME).pipe(map(event => event.data), filter(this.aiMeanedFilter), takeUntil(this.destroyed)).subscribe(this.aiMeanedErrorHandler);

        setTimeout(this.initialize, 3 * DateUtil.MILLISECONDS_SECOND);
    }

    // --------------------------------------------------------------------------
    //
    //  Send Methods
    //
    // --------------------------------------------------------------------------

    private async sendMasterList(item: UserEntity, message: Message): Promise<void> {
        let inline_keyboard = [];
        for (let item of await this.database.userListGet()) {
            inline_keyboard.push([{ text: `🕺 ${item.preferences.name}`, callback_data: UserUtil.createUid(item) }]);
        }
        this.sendMessage(message.chat.id, this.language.translate('messenger.master.action.list.confirmation'), { reply_markup: { inline_keyboard } });
    }

    private async sendContact(item: UserEntity, message: Message): Promise<void> {
        let inline_keyboard = [[this.getContactButton()]];
        this.sendMessage(message.chat.id, this.language.translate('messenger.contact.description'), { reply_markup: { inline_keyboard } });
    }

    private async sendPaymentSubscriptionInvoice(chatId: number, userId: number, account?: MeaningAccountEntity): Promise<void> {
        if (_.isNil(account)) {
            account = await MeaningAccountEntity.getEntity(userId, this.project);
        }
        let date = !_.isNil(account) ? account.expiration.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' }) : null;
        let isExtend = !_.isNil(account) ? !account.isExpired : false;
        let title = this.language.translate(`messenger.payment.action.subscription.${isExtend ? 'extend' : 'buy'}.subscription`, { date });
        let description = this.language.translate(`messenger.payment.action.subscription.${isExtend ? 'extend' : 'buy'}.description`, { date });
        this.bot.sendInvoice(chatId, title, description, 'payload', this.settings.merchant, CoinId.RUB, [{ amount: PaymentService.SUBSCRIPTION_PRICE_MONTH_RUB, label: this.language.translate('messenger.payment.action.subscription.month') }])
    }

    private async sendPhotoAdd(item: UserEntity, message: Message): Promise<void> {
        this.sendMessage(message.chat.id, this.language.translate('messenger.photo.action.add.description'));
    }

    private async sendMasterSelect(item: UserEntity, message: Message): Promise<void> {
        let inline_keyboard = [[this.getMasterListButton()]];
        this.sendMessage(message.chat.id, this.language.translate('messenger.description'), { reply_markup: { inline_keyboard } });
    }

    private async sendMeaning(item: UserEntity, message: Message): Promise<void> {
        let chatId = message.chat.id;
        let chatMessageId = message.message_id;

        if (this.isLocked(item.id)) {
            this.removeMessage(chatId, chatMessageId);
            this.sendMessage(chatId, this.language.translate(`error.${ErrorCode.AI_MASTER_IN_PROGRESS}`));
            return;
        }

        if (_.isEmpty(message.photo) && _.isEmpty(message.document)) {
            this.removeMessage(chatId, chatMessageId);
            this.sendPhotoAdd(item, message);
            return;
        }

        let pictures = await this.getPicturesUrls(message);
        if (_.isEmpty(pictures)) {
            this.removeMessage(chatId, chatMessageId);
            this.sendMessage(chatId, this.language.translate(`error.${ErrorCode.PICTURES_INVALID}`));
            return;
        }

        this.lock(item.id, { chatId, expiration: DateUtil.getDate(Date.now() + DateUtil.MILLISECONDS_MINUTE) });
        this.sendMessage(chatId, this.language.translate('messenger.master.action.mean.progress')).then(chatMessageId => this.transport.send(new AiMeanCommand({ userId: item.id, project: ProjectName.BOT, pictures, chatId, chatMessageId })));
    }

    private async sendDefault(item: UserEntity, message: Message): Promise<void> {
        if (_.isNil(item.preferences.favoriteMasterId)) {
            this.sendMasterSelect(item, message);
        }
        else {
            this.sendMeaning(item, message);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Handler Methods
    //
    // --------------------------------------------------------------------------

    private async masterSelected(message: Message, uid: string): Promise<void> {
        let user = await this.userGet(message);
        let master = await this.database.userGet(parseInt(uid), true);
        let accountId = user.telegram.accountId;

        if (_.isNil(master)) {
            this.editMessage(this.language.translate(`error.${ErrorCode.USER_NOT_FOUND}`), { chat_id: accountId, message_id: message.message_id });
            return;
        }

        if (user.preferences.favoriteMasterId !== master.id) {
            user.preferences.favoriteMasterId = master.id;
            await user.save();
        }

        let text = this.language.translate(`messenger.master.action.list.notification`, { name: master.preferences.name });
        this.editMessage(text, { chat_id: accountId, message_id: message.message_id });
        this.sendPhoto(accountId, master.preferences.picture);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private initialize = async (): Promise<void> => {
        this._bot = new Bot(this.settings.token, { polling: this.settings.isPolling });
        this.bot.on('message', this.messageHandler);
        this.bot.on('callback_query', this.callbackHandler);
        this.bot.on('pre_checkout_query', this.paymentCheckoutHandler);
        this.bot.on('successful_payment', this.paymentSuccessfulHandler);

        this.bot.setMyCommands([
            {
                command: Commands.MASTER_LIST,
                description: this.language.translate('messenger.master.action.list.list')
            },
            {
                command: Commands.PAYMENT_SUBSCRIPTION,
                description: this.language.translate('messenger.payment.action.subscription.buy.subscription')
            },
            {
                command: Commands.CONTACT,
                description: this.language.translate('messenger.contact.contact')
            },
        ]);
    }

    private async userGet(message: Message): Promise<UserEntity> {
        let accountId = message.chat.id;
        let item = await this.database.userGetByTelegram(accountId, true);
        return _.isNil(item) ? this.userCreate(message) : item;
    }

    private async userCreate(message: Message): Promise<UserEntity> {
        let user = new TgUser();
        user.parse(message.chat);

        let item = new UserEntity();
        item.login = LoginUtil.createLogin(user.id, UserResource.TELEGRAM);
        item.status = UserStatus.ACTIVE;
        item.resource = UserResource.TELEGRAM;

        let telegram = (item.telegram = new TelegramAccountEntity());
        telegram.accountId = Number(user.id);

        let account = (item.account = new UserAccountEntity());
        account.type = UserAccountType.DEFAULT;

        let preferences = (item.preferences = new UserPreferencesEntity());
        preferences.name = user.name;
        preferences.locale = message.from?.language_code;
        preferences.telegram = user.telegram;

        ValidateUtil.validate(item);
        return item.save();
    }

    private async getPicturesUrls(message: Message): Promise<Array<string>> {
        let item = null;
        if (!_.isEmpty(message.photo)) {
            item = _.last(_.sortBy(message.photo, 'file_size'));
        }
        else if (!_.isNil(message.document) && FileImageMime.includes(message.document.mime_type)) {
            item = message.document;
        }
        return !_.isNil(item) ? [await this.bot.getFileLink(item.file_id)] : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async sendMessage(chatId: ChatId, text: string, options?: SendMessageOptions): Promise<number> {
        if (!_.isNil(options)) {
            options.parse_mode = 'HTML';
        }
        try {
            let item = await this.bot.sendMessage(chatId, text, options);
            return item.message_id
        }
        catch (error) {
            this.warn(`Telegram message error: "${error.message}"`);
            return null;
        }
    }

    public async sendPhoto(chatId: ChatId, photo: string | Stream | Buffer, options?: SendPhotoOptions, fileOptions?: FileOptions): Promise<void> {
        try {
            await this.bot.sendPhoto(chatId, photo, options, fileOptions);
        }
        catch (error) {
            this.warn(`Telegram message error: "${error.message}"`);
        }
    }

    public async editMessage(text: string, options?: EditMessageTextOptions): Promise<void> {
        try {
            await this.bot.editMessageText(text, options);
        }
        catch (error) {
            this.warn(`Telegram message error: "${error.message}"`);
        }
    }

    public async removeMessage(chatId: number, messageId: number): Promise<void> {
        try {
            await this.bot.deleteMessage(chatId, messageId);
        }
        catch (error) {
            this.warn(`Telegram message error: "${error.message}"`);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Lock Methods
    //
    // --------------------------------------------------------------------------

    private lock(id: number, item: ILock): void {
        this.progress.set(id, item);
    }

    private unlock(id: number): void {
        this.progress.delete(id);
    }

    private isLocked(id: number): boolean {
        let item = this.progress.get(id);
        if (_.isNil(item)) {
            return false;
        }
        if (item.expiration.getTime() > Date.now()) {
            return true;
        }
        this.sendMessage(item.chatId, this.language.translate(`error.${ErrorCode.MEANING_FROZE}`));
        this.unlock(id);
        return false;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    private messageHandler = async (message: Message): Promise<void> => {
        let item = await this.userGet(message);
        let { text } = message;

        if (text?.includes(Commands.MASTER_LIST)) {
            this.sendMasterList(item, message);
        }
        else if (text?.includes(Commands.CONTACT)) {
            this.sendContact(item, message);
        }
        else if (text?.includes(Commands.PAYMENT_SUBSCRIPTION)) {
            this.sendPaymentSubscriptionInvoice(message.chat.id, item.id);
        }
        else {
            this.sendDefault(item, message);
        }
    }

    private paymentSuccessfulHandler = async (item: Message): Promise<void> => {
        let params = item.successful_payment;

        let user = await this.userGet(item);
        let userId = user.id;
        let coinId = params.currency as CoinId;
        let amount = params.total_amount.toString();

        let payment = new PaymentEntity();
        payment.userId = user.id;
        payment.project = this.project;
        payment.status = PaymentStatus.COMPLETED;
        payment.details = JSON.stringify(params);
        payment.aggregator = PaymentAggregatorType.TELEGRAM;
        payment.transactions = [PaymentTransactionEntity.createEntity(userId, PaymentTransactionType.PURCHASE, coinId, amount)];
        payment.transactionId = params.provider_payment_charge_id;
        await payment.save();

        this.transport.dispatch(new PaymentSucceedEvent(payment.id));
    }

    private paymentCheckoutHandler = async (item: PreCheckoutQuery): Promise<void> => {
        this.bot.answerPreCheckoutQuery(item.id, true);
    }

    private callbackHandler = async (item: CallbackQuery): Promise<void> => {
        let { data, message } = item;
        let user = await this.userGet(message);
        if (data === Commands.MASTER_LIST) {
            this.sendMasterList(user, message);
        }
        else if (data === Commands.PAYMENT_SUBSCRIPTION) {
            this.sendPaymentSubscriptionInvoice(message.chat.id, user.id);
        }
        else if (data === Commands.CONTACT) {
            this.sendContact(user, message);
        }
        else if (UserUtil.isUser(data)) {
            this.masterSelected(message, UserUtil.getUid(data));
        }
        else {
            console.log('do nothing')
        }
    }

    private aiMeanedFilter = (params: IAiMeanedDto | IAiMeanedErrorDto): boolean => params.project === this.project;

    private aiMeanedErrorHandler = async (params: IAiMeanedErrorDto): Promise<void> => {
        this.unlock(params.userId);
        await this.removeMessage(params.chatId, params.chatMessageId);

        let { message, chatId } = params;
        switch (params.code) {
            case ErrorCode.MEANINGS_AMOUNT_EXCEED:
                let account = await MeaningAccountEntity.getEntity(params.userId, params.project);
                if (_.isNil(account) || account.isExpired) {
                    this.sendPaymentSubscriptionInvoice(chatId, params.userId, account);
                    return;
                }
                message = this.language.translate('messenger.payment.action.subscription.bought');
                break;
        }
        this.sendMessage(chatId, message);
    }

    private aiMeanedHandler = async (params: IAiMeanedDto): Promise<void> => {
        this.unlock(params.userId);
        await this.removeMessage(params.chatId, params.chatMessageId);
        this.sendMessage(params.chatId, params.meaning);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private getMasterListButton(): InlineKeyboardButton {
        return { text: `🃏 ${this.language.translate('messenger.master.action.list.list')}`, callback_data: Commands.MASTER_LIST };
    }

    private getContactButton(): InlineKeyboardButton {
        return { text: `📧 ${this.language.translate('messenger.contact.contact')}`, url: this.language.translate('messenger.contact.email') };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get bot(): Bot {
        return this._bot;
    }

    public get project(): string {
        return this.settings.project;
    }
}

enum Commands {
    START = 'start',
    CONTACT = 'contact',
    MASTER_LIST = 'master_list',
    PAYMENT_SUBSCRIPTION = 'payment_subscription'
}

let FileImageMime = ['image/jpeg', 'image/png', 'image/webp'];

interface ILock {
    chatId: number;
    expiration: Date;
}

export interface ITelegramBotSettings {
    token: string;
    merchant: string;

    project: string;
    isPolling?: boolean;
}

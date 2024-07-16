import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper, ValidateUtil, DateUtil, Transport } from '@ts-core/common';
import { TgUser } from '@ts-core/oauth';
import { map, filter, takeUntil } from 'rxjs';
import { InlineKeyboardButton, EditMessageTextOptions, FileOptions, SendPhotoOptions, SendMessageOptions, Message, ChatId, CallbackQuery } from 'node-telegram-bot-api';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import { UserAccountEntity, UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { DatabaseService } from '@project/module/database/service';
import { LoginUtil } from '@project/common/login';
import { UserAccountType, UserResource, UserStatus } from '@project/common/user';
import { UserUtil } from '@project/common/util';
import { LocaleGetCommand } from '@project/module/locale/transport';
import { ProjectName } from '@project/common';
import { AiMeanCommand, AiMeanedEvent, IAiMeanedDto } from '@project/module/ai/transport';
import { Stream } from "stream";
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
    private progress: Map<number, IProgress>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private settings: ITelegramBotSettings) {
        super(logger);

        this.progress = new Map();

        transport.getDispatcher<AiMeanedEvent>(AiMeanedEvent.NAME).pipe(map(event => event.data), filter(item => item.project === this.project), takeUntil(this.destroyed)).subscribe(this.aiMeanedHandler);

        setTimeout(this.initialize, 1 * DateUtil.MILLISECONDS_SECOND);
    }

    // --------------------------------------------------------------------------
    //
    //  Send Methods
    //
    // --------------------------------------------------------------------------

    private async sendMasterList(item: UserEntity, message: Message): Promise<void> {
        let items = [];

        for (let item of await this.database.userListGet()) {
            items.push([{ text: `🕺 ${item.preferences.name}`, callback_data: UserUtil.createUid(item) }]);
        }
        await this.sendMessage(message.chat.id, await this.translate('messenger.master.action.list.confirmation'), { reply_markup: { inline_keyboard: items } });
    }

    private async sendDefault(item: UserEntity, message: Message): Promise<void> {
        if (_.isNil(item.preferences.favoriteMasterId)) {
            await this.sendMasterSelect(item, message);
        }
        else if (_.isEmpty(message.photo)) {
            await this.sendPhotoAdd(item, message);
        }
        else {
            await this.sendMeaning(item, message);
        }
    }

    private async sendPhotoAdd(item: UserEntity, message: Message): Promise<void> {
        await this.sendMessage(message.chat.id, await this.translate('messenger.photo.action.add.description'));
    }

    private async sendMasterSelect(item: UserEntity, message: Message): Promise<void> {
        let items = [
            [await this.getMasterListButton()]
        ];
        await this.sendMessage(message.chat.id, await this.translate('messenger.description'), { reply_markup: { inline_keyboard: items } });
    }

    private async sendMeaning(item: UserEntity, message: Message): Promise<void> {
        if (this.progress.has(item.id)) {
            await this.sendMessage(message.chat.id, await this.translate('error.AI_MASTER_IN_PROGRESS'));
            return;
        }

        let chatId = message.chat.id;
        let photos = _.sortBy(message.photo, 'file_size');
        let pictures = [await this.bot.getFileLink(_.last(photos).file_id)];
        let chatMessageId = await this.sendMessage(chatId, await this.translate('messenger.master.action.mean.progress'));

        this.progress.set(item.id, { chatId, chatMessageId, expired: DateUtil.getDate(Date.now() + 3 * DateUtil.MILLISECONDS_MINUTE) });
        this.transport.send(new AiMeanCommand({ userId: item.id, project: ProjectName.BOT, pictures, chatMessageId }));
    }

    // --------------------------------------------------------------------------
    //
    //  Handler Methods
    //
    // --------------------------------------------------------------------------

    private masterSelected = async (message: Message, uid: string): Promise<void> => {
        let user = await this.userGet(message);
        let master = await this.database.userGet(parseInt(uid), true);
        let accountId = user.telegram.accountId;

        if (_.isNil(master)) {
            await this.editMessage(await this.translate('error.USER_NOT_FOUND'), { chat_id: accountId, message_id: message.message_id });
            return;
        }

        if (user.preferences.favoriteMasterId !== master.id) {
            user.preferences.favoriteMasterId = master.id;
            await user.save();
        }

        let text = await this.translate(`messenger.master.action.list.notification`, { name: master.preferences.name });
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

        this.bot.setMyCommands([
            {
                command: Commands.MASTER_LIST,
                description: await this.translate('messenger.master.action.list.list')
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
        account.type = UserAccountType.FREE;

        let preferences = (item.preferences = new UserPreferencesEntity());
        preferences.name = user.name;
        preferences.locale = message.from?.language_code;
        preferences.telegram = user.telegram;

        ValidateUtil.validate(item);
        return item.save();
    }

    private async translate<T>(key: string, params?: T): Promise<string> {
        return this.transport.sendListen(new LocaleGetCommand({ key, params, project: this.settings.project }));
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
        else {
            this.sendDefault(item, message);
        }
    }

    private callbackHandler = async (callbackQuery: CallbackQuery): Promise<void> => {
        let item = await this.userGet(callbackQuery.message);
        let action = callbackQuery.data;
        let message = callbackQuery.message;
        if (action === Commands.MASTER_LIST) {
            this.sendMasterList(item, message);
        }
        else if (UserUtil.isUser(action)) {
            this.masterSelected(message, UserUtil.getUid(action));
        }
        else {

        }
    }

    private aiMeanedHandler = async (params: IAiMeanedDto): Promise<void> => {
        this.progress.delete(params.userId);
        this.editMessage(params.result, { chat_id: params.chatId, message_id: params.chatMessageId });
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private async getMasterListButton(): Promise<InlineKeyboardButton> {
        return { text: `🃏 ${await this.translate('messenger.master.action.list.list')}`, callback_data: Commands.MASTER_LIST };
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
    MASTER_LIST = 'master_list'
}

interface IProgress {
    chatId: number;
    chatMessageId: number;

    expired: Date;
}

export interface ITelegramBotSettings {
    token: string;
    project: string;
    isPolling?: boolean;
}

import { Injectable } from '@nestjs/common';
import { Transport, TransportCommandHandler, DateUtil, Logger, ExtendedError } from '@ts-core/common';
import { AiMeanCommand, IAiMeanDto } from '../AiMeanCommand';
import { DatabaseService } from '@project/module/database/service';
import { AiClient, AiPromptService } from '../../service';
import { AiMeanedEvent } from '../AiMeanedEvent';
import { AiMeanedErrorEvent } from '../AiMeanedErrorEvent';
import { MeaningEntity } from '@project/module/database/meaning';
import { MeaningAccountEntity } from '@project/module/database/meaning';
import { ErrorCode } from '@project/common/api';
import * as _ from 'lodash';
import { LanguageProjects } from '@ts-core/language';

@Injectable()
export class AiMeanHandler extends TransportCommandHandler<IAiMeanDto, AiMeanCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    private static DEFAULT_MAX_MEANING = 3;
    private static MEANING_ACCOUNT_MAX_MEANING = 5;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private api: AiClient, private prompt: AiPromptService, private language: LanguageProjects) {
        super(logger, transport, AiMeanCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async mean(params: IAiMeanDto): Promise<string> {
        let user = await this.database.userGet(params.userId, true);
        let master = await this.database.userGet(user.preferences.favoriteMasterId, true);

        let prompt = await this.prompt.getPrompt(params.project, user, master, params.pictures);
        let result = await this.api.ask(prompt);
        return _.isEmpty(result) ? this.language.translate('error.AI_EMPTY_RESPONSE', null, params.project) : result;
    }

    private async check(params: IAiMeanDto): Promise<void> {
        let meanings = await MeaningEntity.createQueryBuilder('meaning')
            .where('meaning.userId = :userId', { userId: params.userId })
            .andWhere('meaning.project = :project', { project: params.project })
            .andWhere('meaning.created > :date', { date: DateUtil.getDate(Date.now() - DateUtil.MILLISECONDS_DAY) })
            .getCount();

        if (meanings < AiMeanHandler.DEFAULT_MAX_MEANING) {
            return;
        }

        let account = await MeaningAccountEntity.getEntity(params.userId, params.project);
        if (_.isNil(account) || account.isExpired || meanings >= AiMeanHandler.MEANING_ACCOUNT_MAX_MEANING) {
            throw new ExtendedError(ErrorCode.MEANINGS_AMOUNT_EXCEED, ErrorCode.MEANINGS_AMOUNT_EXCEED)
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IAiMeanDto): Promise<void> {
        try {
            await this.check(params);

            let meaning = await this.mean(params);
            await MeaningEntity.createEntity(params.userId, params.project).save();
            this.transport.dispatch(new AiMeanedEvent({ userId: params.userId, chatId: params.chatId, chatMessageId: params.chatMessageId, project: params.project, meaning }));
        }
        catch (error) {
            this.transport.dispatch(new AiMeanedErrorEvent({ userId: params.userId, chatId: params.chatId, chatMessageId: params.chatMessageId, project: params.project, code: error.code, message: error.message }));
        }

    }
}
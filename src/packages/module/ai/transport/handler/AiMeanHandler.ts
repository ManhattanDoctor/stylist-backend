import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { Transport, TransportCommandHandler } from '@ts-core/common';
import { AiMeanCommand, IAiMeanDto } from '../AiMeanCommand';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';
import { AiClient, AiPromptService } from '../../service';
import { LocaleGetCommand } from '@project/module/locale/transport';
import { AiMeanedEvent } from '../AiMeanedEvent';

@Injectable()
export class AiMeanHandler extends TransportCommandHandler<IAiMeanDto, AiMeanCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private api: AiClient, private prompt: AiPromptService) {
        super(logger, transport, AiMeanCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IAiMeanDto): Promise<void> {
        let user = await this.database.userGet(params.userId, true);
        let master = await this.database.userGet(user.preferences.favoriteMasterId, true);

        let result = null;
        try {
            let prompt = await this.prompt.getPrompt(params.project, user, master, params.pictures);
            result = await this.api.ask(prompt);
            if (_.isEmpty(result)) {
                result = await this.transport.sendListen(new LocaleGetCommand({ key: 'error.AI_EMPTY_RESPONSE', project: params.project }));
            }
        }
        catch (error) {
            result = error.message;
        }
        this.transport.dispatch(new AiMeanedEvent({ userId: user.id, chatId: user.telegram.accountId, chatMessageId: params.chatMessageId, project: params.project, result }));
    }
}
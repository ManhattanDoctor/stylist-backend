import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { MeanCommand, IMeanDto } from '../MeanCommand';
import { UserNotFoundError } from '@project/module/core/middleware';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

@Injectable()
export class MeanHandler extends TransportCommandAsyncHandler<IMeanDto, string, MeanCommand> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService) {
        super(logger, transport, MeanCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    /*
    private async notify(user: User, params: INotifyDto): Promise<void> {
        let url: IOneSignalUrl = {};
        if (!_.isNil(params.url)) {
            url.webUrl = params.url.web;
            url.pictureUrl = params.url.picture;
            url.applicationUrl = params.url.application;
        }
        try {
            await this.oneSignal.notify(user.login, params.message, url);
        }
        catch (error) {
            this.warn(`Unable to notify OneSignal: ${error.message}`);
        }
    }
    */

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IMeanDto): Promise<string> {
        let user = await this.database.userGet(params.userId, true);
        if (_.isNil(user)) {
            throw new UserNotFoundError();
        }
        return null;
    }
}
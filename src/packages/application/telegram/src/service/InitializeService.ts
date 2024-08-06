import { Injectable } from '@nestjs/common';
import { ProjectName } from '@project/common';
import { LoginUtil } from '@project/common/login';
import { UserAccountType, UserMasterLevel, UserMasterSkill, UserResource, UserStatus } from '@project/common/user';
import { ShareUtil, UserUtil } from '@project/common/util';
import { DatabaseService } from '@project/module/database/service';
import { UserAccountEntity, UserEntity, UserMasterEntity, UserPreferencesEntity } from '@project/module/database/user';
import { AiMeanCommand } from '@project/module/ai/transport';
import { Logger, LoggerWrapper, Transport, RandomUtil, ValidateUtil } from '@ts-core/common';
import * as _ from 'lodash';
import { PaymentSucceedEvent } from '@project/module/payment/transport';

@Injectable()
export class InitializeService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        //console.log(await this.transport.sendListen(new AiMeanCommand({ userId: 2, project: ProjectName.BOT, pictures: ['https://api.telegram.org/file/bot7453863930:AAETwizYyWKF-MDKXOEcvAxssmNqs2aQG_o/photos/file_1.jpg'] })));
        // console.log(await this.transport.dispatch(new PaymentSucceedEvent(1)));
    }
}

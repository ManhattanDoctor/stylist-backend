import { Injectable } from '@nestjs/common';
import { Logger, ObjectUtil } from '@ts-core/common';
import { Transport, TransportCommandHandler } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { IUserStatisticsUpdateDto, UserStatisticsUpdateCommand } from '../UserStatisticsUpdateCommand';
import { UserStatisticsEntity } from '@project/module/database/user';
import * as _ from 'lodash';

@Injectable()
export class UserStatisticsUpdateHandler extends TransportCommandHandler<IUserStatisticsUpdateDto, UserStatisticsUpdateCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService) {
        super(logger, transport, UserStatisticsUpdateCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IUserStatisticsUpdateDto): Promise<void> {
        let item = await UserStatisticsEntity.findOneBy({ userId: params.id });
        if (_.isNil(item)) {
            item = UserStatisticsEntity.createEntity(params.id);
        }
        ObjectUtil.copyPartial(params.item, item);
        await item.save();
    }
}
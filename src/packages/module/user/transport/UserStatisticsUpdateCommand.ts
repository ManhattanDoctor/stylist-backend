import { UserStatistics } from '@project/common/user';
import { TransportCommand } from '@ts-core/common';

export class UserStatisticsUpdateCommand extends TransportCommand<IUserStatisticsUpdateDto> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'UserStatisticsUpdateCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserStatisticsUpdateDto) {
        super(UserStatisticsUpdateCommand.NAME, request);
    }
}

export interface IUserStatisticsUpdateDto {
    id: number;
    item: Partial<UserStatistics>;
}

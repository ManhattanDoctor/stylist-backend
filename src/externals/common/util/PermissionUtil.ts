import { User, UserAccountType } from '../user';
import * as _ from 'lodash';

export class PermissionUtil {

    //--------------------------------------------------------------------------
    //
    // 	User Methods
    //
    //--------------------------------------------------------------------------

    public static userIsCanCoinAccountsGet(item: User, user: User): boolean {
        if (_.isNil(user)) {
            return false;
        }
        if (PermissionUtil.userIsAdministrator(user)) {
            return true;
        }
        return item.id === user.id;
    }

    public static userIsMaster(item: User): boolean {
        if (PermissionUtil.userIsAdministrator(item)) {
            return true;
        }
        return !_.isNil(item) && !_.isNil(item.account) ? item.account.type === UserAccountType.MASTER : false;
    }

    public static userIsDonater(item: User): boolean {
        return !_.isNil(item) && !_.isNil(item.account) ? item.account.type === UserAccountType.DONATER : false;
    }

    public static userIsAdministrator(item: User): boolean {
        return !_.isNil(item) && !_.isNil(item.account) ? item.account.type === UserAccountType.ADMINISTRATOR : false;
    }
}

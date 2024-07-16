import { UID, getUid } from '@ts-core/common';
import * as _ from 'lodash';

export class UserUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'user';
    public static UID_REG_EXP = new RegExp(`^${UserUtil.PREFIX}_[0-9]+$`, 'gm');

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createUid(uid: UID): string {
        return `${UserUtil.PREFIX}_${getUid(uid)}`;
    }

    public static getUid(item: string): string {
        return item.replaceAll(`${UserUtil.PREFIX}_`, '');
    }

    public static isUser(item: string): boolean {
        return UserUtil.UID_REG_EXP.test(item);
    }
}

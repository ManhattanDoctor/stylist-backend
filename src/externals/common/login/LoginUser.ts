import * as _ from "lodash";
import { UserPreferences, UserResource } from "../user";
import { OAuthUser } from "@ts-core/oauth";
import { ObjectUtil } from "@ts-core/common";

export class LoginUser {

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static getIdByLogin(login: string, resource: UserResource): string {
        return login.replace(`${resource}_`, '');
    }

    public static createLogin(id: string | number, resource: UserResource): string {
        return !_.isNil(id) ? `${resource}_${id}` : null;
    }

    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public id: string;
    public preferences: Partial<UserPreferences>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(item?: OAuthUser) {
        if (!_.isNil(item)) {
            this.parse(item);
        }
    }

    //--------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    //--------------------------------------------------------------------------

    protected parse(item: OAuthUser): void {
        this.id = item.id.toString();
        this.preferences = { location: item.location };
        ObjectUtil.copyProperties(item, this.preferences, ['name', 'email', 'phone', 'locale', 'isMale', 'picture', 'location', 'birthday', 'description', 'vk', 'telegram'])
    }
}
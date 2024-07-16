import { UserResource } from "../user";
import * as _ from "lodash";

export class LoginUtil {

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
}
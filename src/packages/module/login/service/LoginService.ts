import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { ILoginDto, ILoginDtoResponse } from '@project/common/api/login';
import { LoginResource } from '@project/common/login';
import { UserEntity } from '@project/module/database/user';
import { ILoginStrategy, ILoginStrategyProfile } from '../strategy';
import { UserResource, UserStatus, USER_PREFERENCES_NAME_MIN_LENGTH } from '@project/common/user';
import { DatabaseService } from '@project/module/database/service';
import { RandomUtil } from '@ts-core/common';
import { UserGuard } from '@project/module/guard';
import { LoginIdInvalidError } from '@project/module/core/middleware';
import { LoginUtil } from '@project/common/login';
import * as _ from 'lodash';

@Injectable()
export class LoginService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static createLogin(id: string | number, resource: UserResource): string {
        let item = LoginUtil.createLogin(id, resource)
        if (_.isNil(item)) {
            throw new LoginIdInvalidError(id);
        }
        return item;
    }

    public static hashToken(item: string): string {
        return !_.isNil(item) ? createHash('md5').update(item).digest("hex") : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private jwt: JwtService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async add(params: ILoginDto, profile: ILoginStrategyProfile, strategy: ILoginStrategy): Promise<UserEntity> {
        let item = await strategy.createUser(profile);
        item.preferences.name = this.getName(item);
        await item.save();

        await strategy.userAdded(params, item);
        return item;
    }

    private getName(user: UserEntity): string {
        let { name } = user.preferences;
        if (_.isEmpty(name)) {
            return RandomUtil.randomString(USER_PREFERENCES_NAME_MIN_LENGTH);
        }
        if (name.length < USER_PREFERENCES_NAME_MIN_LENGTH) {
            return `${name}${RandomUtil.randomString(USER_PREFERENCES_NAME_MIN_LENGTH - name.length)}`
        }
        return name;
    }

    private getStrategy(resource: LoginResource): ILoginStrategy {
        return null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async login(params: ILoginDto): Promise<ILoginDtoResponse> {
        let strategy = this.getStrategy(params.resource);
        let profile = await strategy.getProfile(params);

        let user = await this.database.userGet(profile.login, false);
        if (_.isNil(user)) {
            user = await this.add(params, profile, strategy);
        }

        UserGuard.checkUser({ isRequired: true, status: [UserStatus.ACTIVE] }, user);

        let payload: LoginUser = { id: user.id, login: user.login, status: user.status };
        let token = this.jwt.sign(payload);

        return { sid: token };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async validate(payload: LoginUser): Promise<UserEntity> {
        let user = await this.database.userGet(payload.id, true);
        UserGuard.checkUser({ isRequired: true, status: [UserStatus.ACTIVE] }, user);
        return Promise.resolve(user);
    }
}

export interface LoginUser {
    id: number;
    login: string;
    status: UserStatus;
}

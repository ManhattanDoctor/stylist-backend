import { Type } from 'class-transformer';
import { IUIDable } from '@ts-core/common';
import { UserMaster } from './UserMaster';
import { UserAccount } from './UserAccount';
import { UserStatistics } from './UserStatistics';
import { UserPreferences } from './UserPreferences';

export class User implements IUIDable {
    public id: number;
    public uid: string;
    public login: string;
    public status: UserStatus;
    public resource: UserResource;

    @Type(() => Date)
    public created: Date;

    @Type(() => UserAccount)
    public account: UserAccount;

    @Type(() => UserPreferences)
    public preferences: UserPreferences;

    @Type(() => UserMaster)
    public master?: UserMaster;

    @Type(() => UserStatistics)
    public statistics?: UserStatistics;
}

export enum UserResource {
    VK = 'VK',
    MAIL = 'MAIL',
    YANDEX = 'YANDEX',
    GOOGLE = 'GOOGLE',
    TELEGRAM = 'TELEGRAM',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    NON_ACTIVE = 'NON_ACTIVE'
}
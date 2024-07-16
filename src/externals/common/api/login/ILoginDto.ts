import { ITraceable } from '@ts-core/common';
import { VkUser, TgUser, IOAuthDto } from '@ts-core/oauth';
import { LoginResource } from './LoginResource';

export interface ILoginDto extends ITraceable {
    data: LoginData;
    resource: LoginResource;
}

export interface ILoginDtoResponse {
    sid: string;
}

export type LoginData = IOAuthDto | TgUser | VkUser;
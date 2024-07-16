import { Type } from 'class-transformer';
import * as _ from 'lodash';

export class UserPreferences {
    name: string;
    phone?: string;
    email?: string;
    isMale?: boolean;
    locale?: string;
    picture?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    description?: string;

    vk?: string;
    facebook?: string;
    telegram?: string;
    instagram?: string;

    favoriteMasterId?: number;

    @Type(() => Date)
    birthday?: Date;
}

export const USER_PREFERENCES_STRING_MAX_LENGTH = 256;

export const USER_PREFERENCES_NAME_MIN_LENGTH = 1;
export const USER_PREFERENCES_NAME_MAX_LENGTH = 50;

export const USER_PREFERENCES_VK_PATTERN = /^$|https?:\/\/vk\.com\/.*/;
export const USER_PREFERENCES_FACEBOOK_PATTERN = /^$|https?:\/\/facebook\.com\/.*/;
export const USER_PREFERENCES_TELEGRAM_PATTERN = /^$|https?:\/\/t\.me\/.*/;
export const USER_PREFERENCES_INSTAGRAM_PATTERN = /^$|https?:\/\/instagram\.com\/.*/;

export const USER_PREFERENCES_PHONE_MAX_LENGTH = 12;
export const USER_PREFERENCES_LOCALE_MAX_LENGTH = 2;
export const USER_PREFERENCES_SOCIAL_MAX_LENGTH = USER_PREFERENCES_STRING_MAX_LENGTH;
export const USER_PREFERENCES_PICTURE_MAX_LENGTH = 1024;
export const USER_PREFERENCES_LOCATION_MAX_LENGTH = USER_PREFERENCES_STRING_MAX_LENGTH;
export const USER_PREFERENCES_DESCRIPTION_MAX_LENGTH = USER_PREFERENCES_STRING_MAX_LENGTH;

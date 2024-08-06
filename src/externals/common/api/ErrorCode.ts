import { FilterableConditionType } from "@ts-core/common";
import { PaymentTransactionType } from "../payment";
import { CoinId } from "../coin";

export enum ErrorCode {
    REQUEST_INVALID = 'REQUEST_INVALID',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    LOCALE_PROJECT_NOT_FOUND = 'LOCALE_PROJECT_NOT_FOUND',

    LOGIN_ID_INVALID = 'LOGIN_ID_INVALID',
    LOGIN_TOKEN_INVALID = 'LOGIN_TOKEN_INVALID',
    LOGIN_TOKEN_EXPIRED = 'LOGIN_TOKEN_EXPIRED',
    LOGIN_SIGNATURE_INVALID = 'LOGIN_SIGNATURE_INVALID',

    USER_UNDEFINED = 'USER_UNDEFINED',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ACCOUNT_INVALID = 'USER_ACCOUNT_INVALID',
    USER_STATUS_INVALID = 'USER_STATUS_INVALID',

    AI_MASTER_IN_PROGRESS = 'AI_MASTER_IN_PROGRESS',
    MEANINGS_AMOUNT_EXCEED = 'MEANINGS_AMOUNT_EXCEED',
    
    TELEGRAM_ACCOUNT_NOT_FOUND = 'TELEGRAM_ACCOUNT_NOT_FOUND',
    TELEGRAM_ACCOUNT_SIGNATURE_INVALID = 'TELEGRAM_ACCOUNT_SIGNATURE_INVALID'
}

export interface IInvalidDto<T = any> {
    name?: string;
    value: T | Array<T>;
    expected?: T | Array<T>;
    condition?: FilterableConditionType;
}

export interface IInsufficientFundsDto {
    value: string;
    target: PaymentTransactionType;
    coinId: CoinId;
    expected: string;
}

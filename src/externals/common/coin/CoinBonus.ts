import { ICoinAmount } from "../coin";

export interface ICoinBonus extends ICoinAmount {
    type: CoinBonusType;
}

export enum CoinBonusType {
    DAILY = 'DAILY',
    DONATER = 'DONATER',
    REGISTRATION = 'REGISTRATION',
}
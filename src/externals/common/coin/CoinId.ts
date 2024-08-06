export enum CoinId {
    RUB = 'RUB',
    XTR = 'XTR',
    TOKEN = 'TOKEN',
}

export interface ICoinAmount {
    amount: string;
    coinId: CoinId;
}

export enum CoinId {
    RUB = 'RUB',
    TOKEN = 'TOKEN',
}

export interface ICoinAmount {
    amount: string;
    coinId: CoinId;
}

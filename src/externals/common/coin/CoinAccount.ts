import { Type } from 'class-transformer';
import { CoinId, ICoinAmount } from './CoinId';
import { User } from '../user';

export class CoinAccount implements ICoinAmount {
    id: number;
    amount: string;
    coinId: CoinId;
    userId: number;

    @Type(() => Date)
    createdDate: Date;

    @Type(() => Date)
    updatedDate: Date;

    @Type(() => User)
    user?: User;
}

export type CoinAccounts = {
    [key in CoinId]?: string;
}

import { Type } from 'class-transformer';
import { PaymentTransaction } from './PaymentTransaction';
import { User } from '../user';

export class Payment {
    id: number;
    userId: number;
    status: PaymentStatus;

    @Type(() => PaymentTransaction)
    transactions: Array<PaymentTransaction>;

    @Type(() => Date)
    createdDate: Date;

    @Type(() => Date)
    updatedDate: Date;

    @Type(() => User)
    user?: User;
    details?: any;
    aggregator?: PaymentAggregatorType;
    transactionId?: string;
}

export enum PaymentAggregatorType {
    MONETA = 'MONETA'
}

export enum PaymentStatus {
    COMPLETED = 'COMPLETED'
}

export enum PaymentAccountId {
    CO_00 = 'CO-00', // Счет компании
    AG_00 = 'AG-00', // Счет аггрегатора
    PR_00 = 'PR-00', // Персональный счет клиента
}

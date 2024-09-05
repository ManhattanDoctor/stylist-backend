
import { Injectable } from '@nestjs/common';
import { Transport, DateUtil, Logger, LoggerWrapper } from '@ts-core/common';
import { PaymentSucceedEvent } from '../transport';
import { map, takeUntil } from 'rxjs';
import * as _ from 'lodash';
import { DatabaseService } from '@project/module/database/service';
import { PaymentEntity, PaymentTransactionEntity } from '@project/module/database/payment';
import { CoinId, CoinUtil } from '@project/common/coin';
import { PaymentTransactionType } from '@project/common/payment';
import { MeaningAccountEntity } from '@project/module/database/meaning';
import { PaymentTransaction } from '@project/common/payment';
import { CoinAccountUpdateCommand } from '@project/module/coin/transport';

@Injectable()
export class PaymentService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static SUBSCRIPTION_PRICE_MONTH_RUB = 9900;
    public static SUBSCRIPTION_PRICE_MILLISECOND = DateUtil.MILLISECONDS_MONTH / 9900;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
        transport.getDispatcher<PaymentSucceedEvent>(PaymentSucceedEvent.NAME).pipe(map(event => event.data), takeUntil(this.destroyed)).subscribe(this.succeedHandler);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getExpirationDelta(item: PaymentTransaction): number {
        switch (item.coinId) {
            case CoinId.XTR:
                return Number(item.amount) * DateUtil.MILLISECONDS_DAY;
            case CoinId.RUB:
                return Number(item.amount) * PaymentService.SUBSCRIPTION_PRICE_MILLISECOND;
        }
        return 0;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    private succeedHandler = async (params: number): Promise<void> => {
        let payment = await this.database.paymentGet(params);
        let transaction = _.last(_.filter(payment.transactions, item => item.type === PaymentTransactionType.PURCHASE));
        if (_.isNil(transaction)) {
            return;
        }

        let { project } = payment;
        let { userId, coinId, amount } = transaction;

        let account = await MeaningAccountEntity.getEntity(userId, project);
        let expiration = Date.now();
        if (_.isNil(account)) {
            account = MeaningAccountEntity.createEntity(userId, project);
        }
        else {
            expiration = Math.max(account.expiration.getTime(), expiration);
        }

        expiration += this.getExpirationDelta(transaction);
        account.expiration = DateUtil.getDate(expiration);
        await account.save();

        payment.transactions.push(PaymentTransactionEntity.createEntity(userId, PaymentTransactionType.SUBSCRIPTION_PURCHASE, coinId, amount));
        await payment.save();

        await this.transport.sendListen(new CoinAccountUpdateCommand({ userId, coinId }));
    }
}
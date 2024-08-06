import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../user';
import { CoinAccounts, CoinId } from '@project/common/coin';
import { PaymentEntity, PaymentTransactionEntity } from '../payment';
import { PaymentAccountId } from '@project/common/payment';
import { User, UserAccountType, UserResource } from '@project/common/user';
import { UserNotFoundError } from '@project/module/core/middleware';
import * as _ from 'lodash';
import { TypeormUtil } from '@ts-core/backend';

@Injectable()
export class DatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getUserQuery(idOrLogin: string | number): SelectQueryBuilder<UserEntity> {
        let item = UserEntity.createQueryBuilder('user');
        if (_.isString(idOrLogin)) {
            item.where('user.login = :login', { login: idOrLogin });
        }
        else if (_.isNumber(idOrLogin)) {
            item.where('user.id = :id', { id: idOrLogin });
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  User Methods
    //
    // --------------------------------------------------------------------------

    public async userGet(idOrLogin: string | number, isNeedRelations: boolean): Promise<UserEntity> {
        let query = this.getUserQuery(idOrLogin);
        if (isNeedRelations) {
            this.userRelationsAdd(query);
            query.leftJoinAndSelect('user.telegram', 'userTelegram');
        }
        return query.getOne();
    }

    public async userGetByTelegram(accountId: number, isNeedRelations: boolean): Promise<UserEntity> {
        let query = this.getUserQuery(null);
        query.leftJoinAndSelect('user.telegram', 'userTelegram');
        query.where('userTelegram.accountId = :accountId', { accountId });
        if (isNeedRelations) {
            this.userRelationsAdd(query);
        }
        return query.getOne();
    }

    public userRelationsAdd<T = any>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        query.leftJoinAndSelect('user.master', 'userMaster');
        query.leftJoinAndSelect('user.account', 'userAccount');
        // query.leftJoinAndSelect('user.telegram', 'userTelegram');
        query.leftJoinAndSelect('user.statistics', 'userStatistics');
        query.leftJoinAndSelect('user.preferences', 'userPreferences');
        return query;
    }

    public async usersGetByLogin(logins: Array<string>, resource: UserResource): Promise<Array<number>> {
        let query = await UserEntity.createQueryBuilder('user');
        query.leftJoinAndSelect('user.account', 'userAccount');
        let items = await query
            .where('user.login IN (:...logins)', { logins })
            .andWhere('user.resource = :resource', { resource })
            .andWhere('userAccount.type IN (:...types)', { types: [UserAccountType.DEFAULT] })
            .getMany();
        return items.map(item => item.id);
    }

    public async userListGet(): Promise<Array<UserEntity>> {
        let query = UserEntity.createQueryBuilder('user');
        this.userRelationsAdd(query);
        query.where('userAccount.type = :type', { type: UserAccountType.MASTER })
        return TypeormUtil.toFilterable(query, {}, async item => item);
    }

    public async userAdministratorGet(): Promise<UserEntity> {
        let query = this.getUserQuery(null);
        this.userRelationsAdd(query);

        let item = await query.where('userAccount.type = :type', { type: UserAccountType.ADMINISTRATOR }).getOne();
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        return item;
    }

    public async userAdministratorIdGet(): Promise<number> {
        let { id } = await this.userAdministratorGet();
        return id;
    }

    // --------------------------------------------------------------------------
    //
    //  Coin Methods
    //
    // --------------------------------------------------------------------------

    public async coinAccounts(idOrLogin: string | number): Promise<CoinAccounts> {
        let query = this.getUserQuery(idOrLogin);
        query.leftJoinAndSelect('user.coinAccounts', 'userCoinAccounts');

        let item = await query.getOne();
        let accounts = {} as any;
        for (let account of item.coinAccounts) {
            accounts[account.coinId] = account.amount;
        }
        return accounts;
    }

    public async coinBalance(userId: User | number, coinId: CoinId = CoinId.TOKEN): Promise<string> {
        if (!_.isNumber(userId)) {
            userId = userId.id;
        }
        let accounts = await this.coinAccounts(userId);
        return !_.isNil(accounts[coinId]) ? accounts[coinId] : '0';
    }

    public async getCoinAmount(userId: number, coinId: CoinId): Promise<string> {
        let account = PaymentAccountId.PR_00;
        let query = PaymentTransactionEntity
            .createQueryBuilder('transaction')
            .select(`SUM(CASE WHEN debet='${account}' THEN amount WHEN credit='${account}' THEN -amount ELSE 0 END)`, 'balance')
            .where(`transaction.coinId = :coinId`, { coinId })
            .andWhere(`transaction.userId = :userId`, { userId })
            .andWhere(`transaction.activated IS NOT NULL`)
            .groupBy('transaction.coinId');

        let item = await query.getRawOne();
        return !_.isNil(item) ? item['balance'] : '0';
    }

    // --------------------------------------------------------------------------
    //
    //  Payment Transaction
    //
    // --------------------------------------------------------------------------

    public async paymentGet(id: number): Promise<PaymentEntity> {
        let query = PaymentEntity.createQueryBuilder('payment').where(`payment.id = :id`, { id });
        this.paymentRelationsAdd(query);
        return query.getOne();
    }

    public paymentRelationsAdd<T = any>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        query.leftJoinAndSelect('payment.user', 'paymentUser');
        query.leftJoinAndSelect('payment.transactions', 'paymentPaymentTransactions');

        query.leftJoinAndSelect('paymentUser.account', 'paymentUserAccount');
        query.leftJoinAndSelect('paymentUser.preferences', 'paymentUserPreferences');
        return query;
    }

    public paymentTransactionRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void { }

}


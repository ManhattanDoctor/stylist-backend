import { ExtendedError, MathUtil, MathUtilConfig, UnreachableStatementError } from '@ts-core/common';
import { CoinId } from './CoinId';
import * as _ from 'lodash';

export class CoinUtil {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    public static TOKEN_RUB_RATE = '1000';

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public static getDecimals(coinId: CoinId): number {
        switch (coinId) {
            case CoinId.RUB:
                return 2;
            case CoinId.TOKEN:
                return 0;
            default:
                throw new UnreachableStatementError(coinId);
        }
    }

    public static fromToken(amount: string, coinId: CoinId): string {
        let rate = null;
        switch (coinId) {
            case CoinId.RUB:
                rate = CoinUtil.TOKEN_RUB_RATE;
        }
        if (_.isNil(rate)) {
            throw new ExtendedError(`Unable convert "${CoinId.TOKEN}" to "${coinId}": rate in undefined`);
        }
        return MathUtil.ceil(MathUtil.multiply(amount, rate));
    }

    public static toToken(amount: string, coinId: CoinId): string {
        let rate = null;
        switch (coinId) {
            case CoinId.RUB:
                rate = CoinUtil.TOKEN_RUB_RATE;
        }
        if (_.isNil(rate)) {
            throw new ExtendedError(`Unable convert "${coinId}" to "${CoinId.TOKEN}": rate in undefined`);
        }
        return CoinUtil.toCent(MathUtil.floor(MathUtil.divide(amount, rate)), CoinId.TOKEN);
    }

    // --------------------------------------------------------------------------
    //
    // 	Transform Methods
    //
    // --------------------------------------------------------------------------

    public static toCent(amount: string, coinId: CoinId): string {
        if (_.isNil(amount)) {
            return null;
        }

        CoinUtil.config = { precision: 100, toExpPos: 100, toExpNeg: -100 };
        let constructor = MathUtil.create();
        let value = MathUtil.pow('10', CoinUtil.getDecimals(coinId).toString());
        let item = new constructor(MathUtil.multiply(amount, value)).toDecimalPlaces(0).toString();
        CoinUtil.config = null;
        return item;
    }

    public static fromCent(amount: string, coinId: CoinId): string {
        if (_.isNil(amount)) {
            return null;
        }
        CoinUtil.config = { precision: 100, toExpPos: 100, toExpNeg: -100 };
        let value = MathUtil.pow('10', CoinUtil.getDecimals(coinId).toString());
        let item = MathUtil.divide(amount, value);
        CoinUtil.config = null;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Static Methods
    //
    // --------------------------------------------------------------------------

    private static get config(): MathUtilConfig {
        return MathUtil.config;
    }

    private static set config(item: MathUtilConfig) {
        MathUtil.config = _.isNil(item) ? { toExpNeg: -100, toExpPos: 100, precision: 100 } : item;
    }
}


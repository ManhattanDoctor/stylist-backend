import { Injectable } from '@nestjs/common';
import { CoinBonusDto } from '@project/common/api/coin';
import { CoinAccounts, CoinBonusType, CoinId, ICoinBonus } from '@project/common/coin';
import { LoginUtil } from '@project/common/login';
import { PaymentTransactionType } from '@project/common/payment';
import { User } from '@project/common/user';
import { CoinAccountUpdateCommand } from '@project/module/coin/transport';
import { PaymentTransactionEntity } from '@project/module/database/payment';
import { DatabaseService } from '@project/module/database/service';
import { UserEntity } from '@project/module/database/user';
import { Logger, Transport, MathUtil, DateUtil, LoggerWrapper } from '@ts-core/common';
import { IUserDetails } from '@project/common/api/user';
import { RequestInvalidError } from '@project/module/core/middleware';
import { PermissionUtil } from '@project/common/util';
import * as _ from 'lodash';

@Injectable()
export class CoinService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DAILY_BONUS = '1';
    public static DONATER_BONUS = '3';
    public static REGISTRATION_BONUS = '5';
    public static VK_IS_FAVORITE_BONUS = '1';
    public static VK_PROFILE_BUTTON_BONUS = '1';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getDailyBonus(user: UserEntity, details?: IUserDetails): Promise<ICoinBonus> {
        let amount = MathUtil.add(CoinService.DAILY_BONUS, await this.getVkAddinitionalAmount(user, details));
        let item = await PaymentTransactionEntity.saveEntity(user.id, PaymentTransactionType.DAILY_BONUS, CoinId.TOKEN, amount);
        return { type: CoinBonusType.DAILY, coinId: item.coinId, amount };
    }

    private async getDonaterBonus(user: UserEntity, details?: IUserDetails): Promise<ICoinBonus> {
        let item = await PaymentTransactionEntity.saveEntity(user.id, PaymentTransactionType.DONATER_BONUS, CoinId.TOKEN, CoinService.DONATER_BONUS);
        return { type: CoinBonusType.DONATER, coinId: item.coinId, amount: item.amount };
    }

    private async getRegistrationBonus(user: UserEntity): Promise<ICoinBonus> {
        let item = await PaymentTransactionEntity.saveEntity(user.id, PaymentTransactionType.REGISTRATION_BONUS, CoinId.TOKEN, CoinService.REGISTRATION_BONUS);
        return { type: CoinBonusType.REGISTRATION, coinId: item.coinId, amount: item.amount };
    }

    private async getVkAddinitionalAmount(user: UserEntity, details: IUserDetails): Promise<string> {
        let item = '0';
        return item;
    }

    private getBonusNextDate(user: UserEntity): Date {
        let item = DateUtil.getDate(Date.now() + DateUtil.MILLISECONDS_DAY);
        item.setHours(0, 0, 0, 0);
        return item;
    }

    private isNeedRegistrationBonus(user: UserEntity): boolean {
        return _.isNil(user.lastLogin);
    }

    private isNeedDailyBonus(user: UserEntity): boolean {
        if (_.isNil(user.lastLogin)) {
            return false;
        }

        let loginDate = new Date();
        let lastLogin = new Date(user.lastLogin);

        lastLogin.setHours(0, 0, 0, 0);
        loginDate.setHours(0, 0, 0, 0);
        return loginDate.getDate() !== lastLogin.getDate();
    }

    private isNeedDonaterBonus(user: UserEntity): boolean {
        return PermissionUtil.userIsDonater(user);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async getAccounts(idOrLogin: string | number): Promise<CoinAccounts> {
        return this.database.coinAccounts(idOrLogin);
    }

    public async getBonuses(user: UserEntity, details?: IUserDetails): Promise<CoinBonusDto> {
        if (user.account.isDisableBonuses) {
            return null;
        }
        let bonuses = new Array();
        if (this.isNeedRegistrationBonus(user)) {
            bonuses.push(await this.getRegistrationBonus(user));
        }
        else if (this.isNeedDailyBonus(user)) {
            bonuses.push(await this.getDailyBonus(user, details));
            if (this.isNeedDonaterBonus(user)) {
                bonuses.push(await this.getDonaterBonus(user, details));
            }
        }
        if (!_.isEmpty(bonuses)) {
            await this.update(user);
        }
        return { nextDate: this.getBonusNextDate(user), bonuses }
    }

    public async update(userId: User | number, coinId: CoinId = CoinId.TOKEN): Promise<void> {
        if (!_.isNumber(userId)) {
            userId = userId.id;
        }
        return this.transport.sendListen(new CoinAccountUpdateCommand({ userId, coinId }));
    }
}
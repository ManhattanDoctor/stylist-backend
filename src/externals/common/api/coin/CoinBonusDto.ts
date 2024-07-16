
import { Type } from 'class-transformer';
import { ICoinBonus } from '../../coin';

export class CoinBonusDto {
    bonuses?: Array<ICoinBonus>;

    @Type(() => Date)
    nextDate?: Date;
}
import { ITraceable } from '@ts-core/common';
import { User } from '../../user';
import { CoinStatusGetDtoResponse } from '../coin';
import { IUserDetails } from '../user';

export interface IInitDto extends ITraceable {
    details?: IUserDetails;
}

export interface IInitDtoResponse extends CoinStatusGetDtoResponse {
    user: User;
}

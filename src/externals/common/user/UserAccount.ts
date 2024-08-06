export class UserAccount {
    type: UserAccountType;
    isDisableBonuses?: boolean;
}

export enum UserAccountType {
    DEFAULT = 'DEFAULT',
    MASTER = 'MASTER',
    ADMINISTRATOR = 'ADMINISTRATOR'
}

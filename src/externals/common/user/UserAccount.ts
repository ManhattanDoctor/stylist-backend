export class UserAccount {
    type: UserAccountType;
    isDisableBonuses?: boolean;
}

export enum UserAccountType {
    FREE = 'FREE',
    MASTER = 'MASTER',
    DONATER = 'DONATER',
    ADMINISTRATOR = 'ADMINISTRATOR'
}


import { User, UserResource, UserStatus } from '@project/common/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Expose, ClassTransformOptions, Type } from 'class-transformer';
import { ValidateNested, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TRANSFORM_PRIVATE } from '../TransformGroup';
import { UserAccountEntity } from './UserAccountEntity';
import { UserPreferencesEntity } from './UserPreferencesEntity';
import { TransformUtil, IUIDable } from '@ts-core/common';
import { UserStatisticsEntity } from './UserStatisticsEntity';
import { UserMasterEntity } from './UserMasterEntity';
import { CoinAccountEntity } from '../coin';
import { PaymentEntity, PaymentTransactionEntity } from '../payment';
import { TelegramAccountEntity } from '../telegram';
import { MeaningAccountEntity, MeaningEntity } from '../meaning';
import * as _ from 'lodash';

@Entity({ name: 'user' })
export class UserEntity extends TypeormValidableEntity implements User, IUIDable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsString()
    public login: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsEnum(UserResource)
    public resource: UserResource;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsEnum(UserStatus)
    public status: UserStatus;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @CreateDateColumn()
    public created: Date;

    @OneToOne(() => UserAccountEntity, account => account.user, { cascade: true })
    @ValidateNested()
    public account: UserAccountEntity;

    @OneToOne(() => UserMasterEntity, master => master.user, { cascade: true })
    @ValidateNested()
    public master: UserMasterEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, { cascade: true })
    @ValidateNested()
    public preferences: UserPreferencesEntity;

    @OneToOne(() => UserStatisticsEntity, statistics => statistics.user, { cascade: true })
    @ValidateNested()
    public statistics: UserStatisticsEntity;

    @OneToOne(() => TelegramAccountEntity, telegram => telegram.user, { cascade: true })
    @ValidateNested()
    public telegram: TelegramAccountEntity;

    @Exclude()
    @Column({ name: 'last_login' })
    @IsOptional()
    @IsDate()
    public lastLogin?: Date;

    @Exclude()
    @OneToMany(() => MeaningEntity, item => item.user)
    @Type(() => MeaningEntity)
    public meanings?: Array<MeaningEntity>;

    @Exclude()
    @OneToMany(() => MeaningAccountEntity, account => account.user, { cascade: true })
    @ValidateNested()
    public meaningAccounts: MeaningAccountEntity;

    @Exclude()
    @OneToMany(() => CoinAccountEntity, item => item.user)
    @Type(() => CoinAccountEntity)
    public coinAccounts?: Array<CoinAccountEntity>;
    
    @Exclude()
    @OneToMany(() => PaymentEntity, item => item.user)
    @Type(() => PaymentEntity)
    public payments?: Array<PaymentEntity>;

    @Exclude()
    @OneToMany(() => PaymentTransactionEntity, item => item.user)
    @Type(() => PaymentTransactionEntity)
    public paymentTransactions?: Array<PaymentTransactionEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toString(): string {
        return `${this.login}(${this.uid})`;
    }

    public toObject(options?: ClassTransformOptions): User {
        return TransformUtil.fromClass<User>(this, options);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get uid(): string {
        return this.id.toString();
    }
}

import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil } from '@ts-core/common';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { JoinColumn, ManyToOne, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import { CoinAccount } from '@project/common/coin';
import * as _ from 'lodash';

@Entity({ name: 'meaning_account' })
export class MeaningAccountEntity extends TypeormValidableEntity {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static getEntity(userId: number, project: string): Promise<MeaningAccountEntity> {
        return MeaningAccountEntity.findOneBy({ userId, project });
    }
    
    public static createEntity(userId: number, project: string): MeaningAccountEntity {
        let item = new MeaningAccountEntity();
        item.userId = userId;
        item.project = project;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    @Column()
    @IsString()
    public project: string;

    @Column()
    @IsDate()
    public expiration: Date;

    @ManyToOne(() => UserEntity, user => user.meaningAccounts)
    @IsOptional()
    @ValidateNested()
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    public user?: UserEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public get isExpired(): boolean {
        return !_.isNil(this.expiration) ? this.expiration.getTime() <= Date.now() : true;
    }

    public toObject(options?: ClassTransformOptions): CoinAccount {
        return TransformUtil.fromClass<CoinAccount>(this, options);
    }
}

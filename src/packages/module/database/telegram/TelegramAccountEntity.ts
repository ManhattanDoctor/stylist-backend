import { TypeormValidableEntity } from '@ts-core/backend';
import { IsNumber, IsOptional } from 'class-validator';
import { Type, Exclude } from 'class-transformer';
import { JoinColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import * as _ from 'lodash';

@Entity({ name: 'telegram_account' })
export class TelegramAccountEntity extends TypeormValidableEntity {

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ name: 'account_id' })
    @IsNumber()
    public accountId: number;

    @Column({ name: 'user_id' })
    @IsNumber()
    @IsOptional()
    public userId?: number;

    @CreateDateColumn({ name: 'created_date' })
    public createdDate: Date;

    @UpdateDateColumn({ name: 'updated_date' })
    public updatedDate: Date;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.telegram)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;
}

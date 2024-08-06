import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil } from '@ts-core/common';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import { CoinAccount, CoinId } from '@project/common/coin';
import * as _ from 'lodash';

@Entity({ name: 'meaning' })
export class MeaningEntity extends TypeormValidableEntity {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(userId: number, project: string): MeaningEntity {
        let item = new MeaningEntity();
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

    @CreateDateColumn({ name: 'created' })
    public created: Date;

    @ManyToOne(() => UserEntity, user => user.meanings)
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

    public toObject(options?: ClassTransformOptions): CoinAccount {
        return TransformUtil.fromClass<CoinAccount>(this, options);
    }
}

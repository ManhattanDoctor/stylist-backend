import { UserMaster, UserMasterLevel, UserMasterSkill } from '@project/common/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Expose, Exclude, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import * as _ from 'lodash';
import { TRANSFORM_SINGLE } from '../TransformGroup';

@Entity({ name: 'user_master' })
export class UserMasterEntity extends TypeormValidableEntity implements UserMaster {

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

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsString()
    public voice: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'varchar' })
    @IsEnum(UserMasterLevel)
    public level: UserMasterLevel;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsString()
    public status: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'varchar', array: true })
    @IsString({ each: true })
    public photos: Array<string>;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'varchar', array: true })
    @IsString({ each: true })
    public skills: Array<UserMasterSkill>;

    @Exclude()
    @Column()
    @IsString()
    public role: string;

    @Exclude()
    @Column()
    @IsString()
    @IsOptional()
    public manner: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsString()
    public biography: string;

    @Column()
    @IsString()
    public video: string;

    @Column({ name: 'video_small' })
    @IsString()
    public videoSmall: string;

    @Column()
    @IsString()
    public picture: string;

    @Column({ name: 'picture_small' })
    @IsString()
    public pictureSmall: string;

    @Column({ name: 'picture_animated' })
    @IsString()
    public pictureAnimated: string;

    @Column({ name: 'picture_animated_small' })
    @IsString()
    public pictureAnimatedSmall: string;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.master)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;
}

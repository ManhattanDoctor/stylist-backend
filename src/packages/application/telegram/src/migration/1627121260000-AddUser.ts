import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1627121260000 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "user"
            (
                "id" serial not null 
                    constraint "user_id_pkey" primary key,
                "login" varchar not null 
                    constraint "user_login_pkey" unique,
                "resource" varchar not null,
                "status" varchar not null,
                "last_login" timestamp,
                "created" timestamp default now() not null
            );

            create table if not exists "user_account"
            (
                "id" serial not null 
                    constraint "user_account_id_pkey" primary key,
                "user_id" integer
                    constraint "user_account_user_id_key" unique
                    constraint "user_account_user_id_fkey" references "user" on delete cascade,
                "type" varchar not null,
                "is_disable_bonuses" boolean
            );

            create table if not exists "user_preferences"
            (
                "id" serial not null 
                    constraint "user_preferences_id_pkey" primary key,
                "user_id" integer
                    constraint "user_preferences_user_id_key" unique
                    constraint "user_preferences_user_id_fkey" references "user" on delete cascade,
                "name" varchar not null,
                "phone" varchar,
                "email" varchar,
                "locale" varchar,
                "picture" varchar,
                "birthday" timestamp,
                "description" varchar,
                "is_male" boolean,

                "location" varchar,
                "latitude" numeric,
                "longitude" numeric,

                "vk" varchar,
                "facebook" varchar,
                "telegram" varchar,
                "instagram" varchar,

                "favorite_master_id" integer
                    constraint "user_preferences_favorite_master_id_fkey" references "user"
            );

            create table if not exists "user_statistics"
            (
                "id" serial not null 
                    constraint "user_statistics_id_pkey" primary key,
                "user_id" integer
                    constraint "user_statistics_user_id_key" unique
                    constraint "user_statistics_user_id_fkey" references "user" on delete cascade
            );

            create table if not exists "user_master"
            (                
                "id" serial not null 
                    constraint "user_master_id_pkey" primary key,
                "user_id" integer
                    constraint "user_master_user_id_key" unique
                    constraint "user_master_user_id_fkey" references "user" on delete cascade,
                "voice" varchar not null,
                "level" varchar not null,
                "status" varchar not null,
                "photos" varchar ARRAY not null,
                "skills" varchar ARRAY not null,
                "role" varchar not null,
                "biography" varchar not null,
                "video" varchar not null,
                "video_small" varchar not null,
                "picture" varchar not null,
                "picture_small" varchar not null,
                "picture_animated" varchar not null,
                "picture_animated_small" varchar not null,

                "manner" varchar not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "user" cascade;
        `;
        await queryRunner.query(sql);
    }
}

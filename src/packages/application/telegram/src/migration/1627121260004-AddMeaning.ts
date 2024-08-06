import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMeaning1627121260004 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `        
            create table if not exists "meaning"
            (                
                "id" serial not null
                    constraint "meaning_id_pkey" primary key,

                "user_id" integer not null
                    constraint "meaning_user_id_fkey" references "user" on delete cascade,

                "project" varchar not null,

                "created" timestamp default now() not null
            );

            create table if not exists "meaning_account"
            (                
                "id" serial not null
                    constraint "meaning_account_id_pkey" primary key,

                "user_id" integer not null
                    constraint "meaning_account_user_id_fkey" references "user" on delete cascade,

                "project" varchar not null,
                "expiration" timestamp not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "meaning" cascade;
            drop table if exists "meaning_account" cascade;
        `;
        await queryRunner.query(sql);
    }
}

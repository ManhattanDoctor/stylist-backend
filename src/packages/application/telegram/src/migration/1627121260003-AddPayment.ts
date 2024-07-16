import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayment1627121260003 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `        
            create table if not exists "payment"
            (                
                "id" serial not null
                    constraint "payment_id_pkey" primary key,

                "user_id" integer not null
                    constraint "payment_user_id_fkey" references "user",

                "status" varchar not null,
                "aggregator" varchar not null,

                "details" json,
                "transaction_id" varchar,

                "created_date" timestamp default now() not null,
                "updated_date" timestamp default now() not null
            );

            create table if not exists "payment_transaction"
            (                
                "id" serial not null
                    constraint "payment_transaction_pkey" primary key,

                "user_id" integer not null
                    constraint "payment_transaction_user_id_fkey" references "user",

                "payment_id" integer
                    constraint "payment_transaction_payment_id_fkey" references "payment",

                "type" varchar not null,
                "debet" varchar not null,
                "credit" varchar not null,
                "amount" numeric not null,
                "coin_id" varchar not null,
                "created_date" timestamp default now() not null,

                "activated_date" timestamp,

                "item_id" integer,
                "item_type" varchar
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "payment" cascade;
            drop table if exists "payment_transaction" cascade;
        `;
        await queryRunner.query(sql);
    }
}

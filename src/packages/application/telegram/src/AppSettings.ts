import { AbstractSettings } from '@project/module/core';
import { IDatabaseSettings } from '@ts-core/backend';
import { isBase64 } from 'class-validator';
import * as _ from 'lodash';

export class AppSettings extends AbstractSettings implements IDatabaseSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Database Properties
    //
    // --------------------------------------------------------------------------

    public get databaseUri(): string {
        return null;
    }

    public get databaseHost(): string {
        return this.getValue('POSTGRES_DB_HOST');
    }

    public get databasePort(): number {
        return this.getValue('POSTGRES_DB_PORT', 5432);
    }

    public get databaseName(): string {
        return this.getValue('POSTGRES_DB');
    }

    public get databaseUserName(): string {
        return this.getValue('POSTGRES_USER');
    }

    public get databaseUserPassword(): string {
        let value = this.getValue<string>('POSTGRES_PASSWORD');
        return isBase64(value) ? Buffer.from(value, 'base64').toString() : value;
    }

    public get databaseSslCa(): string {
        let value = this.getValue<string>('POSTGRES_SSL_CA');
        if (_.isNil(value)) {
            return null;
        }
        if (isBase64(value)) {
            value = Buffer.from(value, 'base64').toString();
        }
        return AbstractSettings.parsePEM(value);
    }

    public get databaseSslСert(): string {
        return this.getValue('POSTGRES_SSL_CERT');
    }

    // --------------------------------------------------------------------------
    //
    //  Ai Properties
    //
    // --------------------------------------------------------------------------

    public get openAiApiKey(): string {
        return this.getValue('OPEN_AI_API_KEY');
    }

    // --------------------------------------------------------------------------
    //
    //  Telegram Properties
    //
    // --------------------------------------------------------------------------

    public get telegramToken(): string {
        return this.getValue('TELEGRAM_TOKEN');
    }

    public get telegramMerchantToken(): string {
        return this.getValue('TELEGRAM_MERCHANT_TOKEN');
    }

}

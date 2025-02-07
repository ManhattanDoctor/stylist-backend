import { AbstractSettings } from '@project/module/core';
import { AbstractSettingsStorage } from '@ts-core/common';
import { IDatabaseSettings } from '@ts-core/backend';
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
        return this.getValue('POSTGRES_PASSWORD');
    }

    public get databaseSslCa(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('POSTGRES_SSL_CA'));
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

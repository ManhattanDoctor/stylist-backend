import { AbstractSettings } from '@project/module/core';
import { IJwtStrategySettings } from '@project/module/login/strategy';
import { ITelegramBotSettings } from '@project/module/telegram-bot/service';
import { IDatabaseSettings } from '@ts-core/backend';

export class AppSettings extends AbstractSettings implements IJwtStrategySettings, IDatabaseSettings {
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

    // --------------------------------------------------------------------------
    //
    //  JWT Properties
    //
    // --------------------------------------------------------------------------

    public get jwtSecret(): string {
        return this.getValue('JWT_SECRET');
    }

    public get jwtExpiresTimeout(): number {
        return this.getValue('JWT_EXPIRES_TIMEOUT', 3110400000);
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

}

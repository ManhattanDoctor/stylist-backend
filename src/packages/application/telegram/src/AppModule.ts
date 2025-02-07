import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule, TransportModule, TransportType, CacheModule } from '@ts-core/backend-nestjs';
import { IDatabaseSettings, ModeApplication } from '@ts-core/backend';
import { AppSettings } from './AppSettings';
import { TlsOptions } from 'tls';
import { UserModule } from '@project/module/user';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@project/module/database';
import { Logger } from '@ts-core/common';
import { modulePath } from '@project/module';
import { AiModule } from '@project/module/ai';
import { THROTTLE_LIMIT_DEFAULT, THROTTLE_TTL_DEFAULT } from '@project/module/guard';
import { InitializeService } from './service';
import { LanguageModule } from '@ts-core/backend-nestjs-language';
import { CoinModule } from '@project/module/coin';
import { PaymentModule } from '@project/module/payment';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramBotModule } from '@project/module/telegram-bot';
import { ProjectName } from '@project/common';
import * as _ from 'lodash';

export class AppModule extends ModeApplication implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [
                CacheModule.forRoot(),
                LoggerModule.forRoot(settings),
                TypeOrmModule.forRoot(AppModule.getOrmConfig(settings)[0]),
                TransportModule.forRoot({ type: TransportType.LOCAL }),

                ScheduleModule.forRoot(),
                ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_DEFAULT, limit: THROTTLE_LIMIT_DEFAULT }]),

                CoinModule,
                UserModule,
                PaymentModule,

                DatabaseModule,

                AiModule.forRoot({ key: settings.openAiApiKey }),

                LanguageModule.forRoot({ path: `${process.cwd()}/locale`, projects: [{ name: ProjectName.BOT, locales: ['ru'], prefixes: ['Server.json'] }] }),
                // LanguageModule.forRoot({ path: `/Users/renat.gubaev/Work/JS/appraiser/appraiser-backend/locale`, projects: [{ name: ProjectName.BOT, locales: ['ru'], prefixes: ['Server.json'] }] }),
                TelegramBotModule.forRoot({ token: settings.telegramToken, merchant: settings.telegramMerchantToken, project: ProjectName.BOT, isPolling: true }),
            ],
            providers: [
                InitializeService,
                {
                    provide: AppSettings,
                    useValue: settings
                },
                {
                    provide: APP_GUARD,
                    useClass: ThrottlerGuard
                }
            ]
        };
    }

    public static getOrmConfig(settings: IDatabaseSettings): Array<TypeOrmModuleOptions> {
        let ssl: TlsOptions = undefined;
        if (!_.isNil(settings.databaseSslCa)) {
            ssl = { ca: settings.databaseSslCa }
        }
        return [
            {
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,
                synchronize: false,
                logging: false,

                entities: [
                    `${__dirname}/**/*Entity.{ts,js}`,
                    `${modulePath()}/database/**/*Entity.{ts,js}`,
                    `../../../..node_modules/@ts-core/notification-backend/database/**/*Entity.{ts,js}`
                ],
                autoLoadEntities: true,
                migrations: [__dirname + '/migration/*.{ts,js}'],
                migrationsRun: true,
                ssl
            },
            {
                name: 'seed',
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,
                synchronize: false,
                logging: false,
                entities: [
                    `${__dirname}/**/*Entity.{ts,js}`,
                    `${modulePath()}/database/**/*Entity.{ts,js}`,
                    `../../../../node_modules/@ts-core/notification-backend/database/**/*Entity.{ts,js}`
                ],
                migrations: [__dirname + '/seed/*.{ts,js}'],
                migrationsRun: true,
                migrationsTableName: 'migrations_seed',
                ssl
            }
        ];
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) logger: Logger, settings: AppSettings, private service: InitializeService) {
        super('Telegram Bot', settings, logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();
        await this.service.initialize();
        if (this.settings.isTesting) {
            this.warn(`Service works in ${this.settings.mode}: some functions could work different way`);
        }
    }
}

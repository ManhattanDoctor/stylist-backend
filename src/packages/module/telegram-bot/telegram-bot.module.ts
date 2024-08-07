import { DynamicModule } from '@nestjs/common';
import { Logger, Transport } from '@ts-core/common';
import { SharedModule } from '@project/module/shared';
import { ITelegramBotSettings, TelegramBotService } from './service';
import { DatabaseModule } from '@project/module/database';
import { DatabaseService } from '@project/module/database/service';
import { MeanHandler } from './transport/handler';
import { LanguageProjects } from '@ts-core/language';

export class TelegramBotModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ITelegramBotSettings): DynamicModule {
        return {
            module: TelegramBotModule,
            imports: [
                SharedModule,
                DatabaseModule
            ],
            providers: [
                {
                    provide: TelegramBotService,
                    inject: [Logger, Transport, DatabaseService, LanguageProjects],
                    useFactory: (logger, transport, database, language) => new TelegramBotService(logger, transport, database, settings, language)
                },
                MeanHandler
            ]
        };
    }

}
import { DynamicModule } from '@nestjs/common';
import { Logger, Transport } from '@ts-core/common';
import { SharedModule } from '@project/module/shared';
import { ITelegramBotSettings, TelegramBotService } from './service';
import { DatabaseModule } from '@project/module/database';
import { DatabaseService } from '@project/module/database/service';
import { MeanHandler } from './transport/handler';

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
                    inject: [Logger, Transport, DatabaseService],
                    useFactory: (logger, transport, database) => new TelegramBotService(logger, transport, database, settings)
                },

                MeanHandler
            ]
        };
    }

}
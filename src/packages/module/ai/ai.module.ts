import { DynamicModule } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { SharedModule } from '@project/module/shared';
import { AiClient, AiPromptService } from './service';
import { AiMeanHandler } from './transport/handler';
import { DatabaseModule } from '@project/module/database';

export class AiModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IAiSettings): DynamicModule {
        return {
            module: AiModule,
            global: true,
            imports: [
                SharedModule,
                DatabaseModule
            ],
            providers: [
                {
                    provide: AiClient,
                    inject: [Logger],
                    useFactory: (logger) => new AiClient(logger, settings.key)
                },
                AiPromptService,
                AiMeanHandler
            ]
        };
    }

}

export interface IAiSettings {
    key: string;
}
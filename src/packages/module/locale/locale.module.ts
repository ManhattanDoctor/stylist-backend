import { DynamicModule } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { CacheModule } from '@ts-core/backend-nestjs';
import { LocaleService } from './service';
import { SharedModule } from '@project/module/shared';
import { Logger } from '@ts-core/common';
import { LanguageLocale, LanguageTranslator } from '@ts-core/language';
import * as _ from 'lodash';
import { LocaleGetHandler } from './transport/handler';

export class LocaleModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ILocaleSettings): DynamicModule {
        return {
            module: LocaleModule,
            imports: [LoggerModule, CacheModule, SharedModule],
            global: true,
            providers: [
                {
                    provide: LocaleService,
                    inject: [Logger],
                    useFactory: async (logger: Logger) => {
                        let item = new LocaleService(logger);
                        await item.initialize(settings.path, settings.projects, settings.locales, settings.prefixes);
                        return item;
                    }
                },
                LocaleGetHandler
            ]
        };
    }
}

export interface ILocaleSettings {
    path: string;
    locales: Array<string>;
    prefixes: Array<string>;
    projects: Array<string>;
}

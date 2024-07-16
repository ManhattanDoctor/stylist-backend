import { Global, Module } from '@nestjs/common';
import { SharedModule } from '@project/module/shared';
import { CoinAccountUpdateHandler } from './transport/handler';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { DatabaseModule } from '@project/module/database';
import { CoinService } from './service';

@Global()
@Module({
    imports: [LoggerModule, SharedModule, DatabaseModule],
    providers: [CoinService, CoinAccountUpdateHandler],
    exports: [CoinService]
})
export class CoinModule { }
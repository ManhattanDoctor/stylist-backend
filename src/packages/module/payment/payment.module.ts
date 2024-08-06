import { Module, Global } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { SharedModule } from '@project/module/shared';
import { DatabaseModule } from '@project/module/database';
import { PaymentService } from './service';

@Global()
@Module({
    imports: [LoggerModule, DatabaseModule, SharedModule],
    providers: [PaymentService]
})
export class PaymentModule { }

import { Module } from '@nestjs/common';
import { SharedModule } from '@project/module/shared';
import { DatabaseModule } from '@project/module/database';
import { UserStatisticsUpdateHandler } from './transport/handler';

@Module({
    imports: [DatabaseModule, SharedModule],
    providers: [ UserStatisticsUpdateHandler]
})
export class UserModule { }

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { SharedModule } from '@project/module/shared';
@Module({
    imports: [SharedModule, DatabaseModule],
})
export class GuardModule { }

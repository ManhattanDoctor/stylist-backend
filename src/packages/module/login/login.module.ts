import { PassportModule } from '@nestjs/passport';
import { TransportModule } from '@ts-core/backend-nestjs';
import { DatabaseModule } from '../database';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './service';
import { DynamicModule } from '@nestjs/common';
import { JwtStrategy } from './strategy/JwtStrategy';
import { IJwtStrategySettings } from './strategy';
import { GuardModule } from '@project/module/guard';
import { SharedModule } from '@project/module/shared';
import { CoinModule } from '@project/module/coin';

export class LoginModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ILoginSettings): DynamicModule {
        return {
            module: LoginModule,
            global: true,
            imports: [
                GuardModule,
                SharedModule,

                CoinModule,
                DatabaseModule,
                TransportModule,
                JwtModule.register({ secret: settings.jwtSecret, signOptions: { expiresIn: settings.jwtExpiresTimeout } }),
                PassportModule.register({ defaultStrategy: 'jwt' })
            ],
            providers: [
                {
                    provide: JwtStrategy,
                    inject: [LoginService],
                    useFactory: (login) => new JwtStrategy(settings, login)
                },
                LoginService
            ]
        };
    }
}

export type ILoginSettings = IJwtStrategySettings;

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from './auth.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadBaseConfig } from '@/config/base.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadBaseConfig],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
    }),
  ],
  providers: [AuthStrategy],
})
export class AuthModule {}

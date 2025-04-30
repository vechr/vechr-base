import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthStrategy } from './auth.strategy';
import appConfig from '@/config/app.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: appConfig.jwt.secret,
      signOptions: { expiresIn: appConfig.jwt.expiresIn },
    }),
    ClientsModule.register([
      {
        name: appConfig.nats.service,
        transport: Transport.NATS,
        options: {
          servers: [appConfig.nats.url],
          maxReconnectAttempts: 10,
          tls: {
            caFile: appConfig.nats.ca,
            keyFile: appConfig.nats.key,
            certFile: appConfig.nats.cert,
          },
        },
      },
    ]),
  ],
  providers: [AuthStrategy],
})
export default class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigCollectorService } from './config-collector.service';

@Module({
  providers: [ConfigCollectorService],
  exports: [ConfigCollectorService],
})
export class ConfigCollectorModule {}

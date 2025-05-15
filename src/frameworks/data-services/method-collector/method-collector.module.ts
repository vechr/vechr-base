import { Module, Global } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MethodCollectorService } from './method-collector.service';

/**
 * Module that makes method collector decorator functionality available in the application.
 * It is marked as @Global() so it only needs to be imported once in the application.
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MethodCollectorService],
  exports: [MethodCollectorService],
})
export class MethodCollectorModule {}

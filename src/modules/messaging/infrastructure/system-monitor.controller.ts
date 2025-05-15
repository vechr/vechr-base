import { Controller } from '@nestjs/common';
import { SystemMonitorHandler } from '../domain/usecases/handlers/system-monitor.handler';
import { SYSTEM_MONITOR_MESSAGE_TYPE } from '../domain/usecases/handlers/constant.handler';
import { LoggedMessagePattern, RpcExtendedController } from '@/frameworks';
import { OtelInstanceCounter, OtelMethodCounter } from 'nestjs-otel';

@RpcExtendedController()
@OtelInstanceCounter()
@Controller()
export class SystemMonitorController {
  constructor(private readonly systemMonitorHandler: SystemMonitorHandler) {}

  @LoggedMessagePattern(
    SYSTEM_MONITOR_MESSAGE_TYPE,
    'health',
    'Check the health status of the service',
  )
  @OtelMethodCounter()
  async health() {
    return this.systemMonitorHandler.health();
  }
}

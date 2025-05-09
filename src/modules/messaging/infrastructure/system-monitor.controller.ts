import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SystemMonitorHandler } from '../domain/usecases/handlers/system-monitor.handler';
import { SubjectFactory } from '../domain/usecases/factories/subject.factory';
import { SYSTEM_MONITOR_MESSAGE_TYPE } from '../domain/usecases/handlers/constant.handler';
import { Authentication } from '@/frameworks';

@Controller()
export class SystemMonitorController {
  constructor(private readonly systemMonitorHandler: SystemMonitorHandler) {}

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_MONITOR_MESSAGE_TYPE, 'health'),
  )
  @Authentication(true)
  async health() {
    return this.systemMonitorHandler.health();
  }
}

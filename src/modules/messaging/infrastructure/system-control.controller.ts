import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SystemControlHandler } from '../domain/usecases/handlers/system-control.handler';
import { SubjectFactory } from '../domain/usecases/factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from '../domain';
import { Authentication } from '@/frameworks';

@Controller()
export class SystemControlController {
  constructor(private readonly systemControlHandler: SystemControlHandler) {}

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'exit'),
  )
  @Authentication(true)
  async exit() {
    return this.systemControlHandler.exit();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfiguration',
    ),
  )
  @Authentication(true)
  async getConfiguration(data: { name: string }) {
    return this.systemControlHandler.getConfiguration(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationNames',
    ),
  )
  @Authentication(true)
  async getConfigurationNames(data: any) {
    return this.systemControlHandler.getConfigurationNames(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationParameter',
    ),
  )
  @Authentication(true)
  async getConfigurationParameter(data: { paramName: string }) {
    return this.systemControlHandler.getConfigurationParameter(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getControlList'),
  )
  @Authentication(true)
  async getControlList(data: any) {
    return this.systemControlHandler.getControlList(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getManifestData'),
  )
  @Authentication(true)
  async getManifestData(data: any) {
    return this.systemControlHandler.getManifestData(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getMemoryInfo'),
  )
  @Authentication(true)
  async getMemoryInfo(data: any) {
    return this.systemControlHandler.getMemoryInfo(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getStatus'),
  )
  @Authentication(true)
  async getStatus() {
    return this.systemControlHandler.getStatus();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getSystemProperties',
    ),
  )
  @Authentication(true)
  async getSystemProperties() {
    return this.systemControlHandler.getSystemProperties();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restart'),
  )
  @Authentication(true)
  async restart() {
    return this.systemControlHandler.restart();
  }
}

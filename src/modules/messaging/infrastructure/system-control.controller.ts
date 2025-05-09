import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SystemControlHandler } from '../domain/usecases/handlers/system-control.handler';
import { SubjectFactory } from '../domain/usecases/factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from '../domain';

@Controller()
export class SystemControlController {
  constructor(private readonly systemControlHandler: SystemControlHandler) {}

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'exit'),
  )
  async exit() {
    return this.systemControlHandler.exit();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfiguration',
    ),
  )
  async getConfiguration(data: { name: string }) {
    return this.systemControlHandler.getConfiguration(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationNames',
    ),
  )
  async getConfigurationNames(data: any) {
    return this.systemControlHandler.getConfigurationNames(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationParameter',
    ),
  )
  async getConfigurationParameter(data: { paramName: string }) {
    return this.systemControlHandler.getConfigurationParameter(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getControlList'),
  )
  async getControlList(data: any) {
    return this.systemControlHandler.getControlList(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getManifestData'),
  )
  async getManifestData(data: any) {
    return this.systemControlHandler.getManifestData(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getMemoryInfo'),
  )
  async getMemoryInfo(data: any) {
    return this.systemControlHandler.getMemoryInfo(data);
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getStatus'),
  )
  async getStatus() {
    return this.systemControlHandler.getStatus();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getSystemProperties',
    ),
  )
  async getSystemProperties() {
    return this.systemControlHandler.getSystemProperties();
  }

  @MessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restart'),
  )
  async restart() {
    return this.systemControlHandler.restart();
  }
}

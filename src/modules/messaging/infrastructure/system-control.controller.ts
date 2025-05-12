import { Body, Controller } from '@nestjs/common';
import { SystemControlHandler } from '../domain/usecases/handlers/system-control.handler';
import { SubjectFactory } from '../domain/usecases/factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from '../domain';
import { LoggedMessagePattern, RpcAuth } from '@/frameworks';
import {
  GetConfigurationParameterValidator,
  GetConfigurationValidator,
  GetControlListValidator,
} from '../domain/usecases/entities/system-control.validator';
@Controller()
export class SystemControlController {
  constructor(private readonly systemControlHandler: SystemControlHandler) {}

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'exit'),
  )
  @RpcAuth(`system-control:write@auth`)
  async exit() {
    return this.systemControlHandler.exit();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfiguration',
    ),
  )
  @RpcAuth(`system-control:read@auth`)
  async getConfiguration(@Body() data: GetConfigurationValidator) {
    return this.systemControlHandler.getConfiguration(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationNames',
    ),
  )
  @RpcAuth(`system-control:read@auth`)
  async getConfigurationNames() {
    return this.systemControlHandler.getConfigurationNames();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationParameter',
    ),
  )
  @RpcAuth(`system-control:read@auth`)
  async getConfigurationParameter(
    @Body() data: GetConfigurationParameterValidator,
  ) {
    return this.systemControlHandler.getConfigurationParameter(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getControlList'),
  )
  @RpcAuth(`system-control:read@auth`)
  async getControlList(@Body() data: GetControlListValidator) {
    return this.systemControlHandler.getControlList(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getManifestData'),
  )
  @RpcAuth(`system-control:read@auth`)
  async getManifestData() {
    return this.systemControlHandler.getManifestData();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getMemoryInfo'),
  )
  @RpcAuth(`system-control:read@auth`)
  async getMemoryInfo() {
    return this.systemControlHandler.getMemoryInfo();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getStatus'),
  )
  @RpcAuth(`system-control:read@auth`)
  async getStatus() {
    return this.systemControlHandler.getStatus();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getSystemProperties',
    ),
  )
  @RpcAuth(`system-control:read@auth`)
  async getSystemProperties() {
    return this.systemControlHandler.getSystemProperties();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restart'),
  )
  @RpcAuth(`system-control:write@auth`)
  async restart() {
    return this.systemControlHandler.restart();
  }
}

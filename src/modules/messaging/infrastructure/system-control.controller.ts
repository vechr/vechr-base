import { Body, Controller } from '@nestjs/common';
import { SystemControlHandler } from '../domain/usecases/handlers/system-control.handler';
import { SubjectFactory } from '../domain/usecases/factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from '../domain';
import {
  LoggedMessagePattern,
  RpcAuth,
  RpcBodyValidationPipe,
  RpcExtendedController,
} from '@/frameworks';
import {
  GetConfigurationParameterValidator,
  GetConfigurationValidator,
  GetControlListValidator,
} from '../domain/usecases/entities/system-control.validator';
import { OtelInstanceCounter, OtelMethodCounter } from 'nestjs-otel';

@RpcExtendedController()
@OtelInstanceCounter()
@Controller()
export class SystemControlController {
  constructor(private readonly systemControlHandler: SystemControlHandler) {}

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'exit'),
  )
  @RpcAuth(`system-control:write@auth`)
  @OtelMethodCounter()
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
  @OtelMethodCounter()
  async getConfiguration(
    @Body(new RpcBodyValidationPipe()) data: GetConfigurationValidator,
  ) {
    return this.systemControlHandler.getConfiguration(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(
      SYSTEM_CONTROL_MESSAGE_TYPE,
      'getConfigurationNames',
    ),
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
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
  @OtelMethodCounter()
  async getConfigurationParameter(
    @Body(new RpcBodyValidationPipe()) data: GetConfigurationParameterValidator,
  ) {
    return this.systemControlHandler.getConfigurationParameter(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getControlList'),
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getControlList(
    @Body(new RpcBodyValidationPipe()) data: GetControlListValidator,
  ) {
    return this.systemControlHandler.getControlList(data);
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getManifestData'),
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getManifestData() {
    return this.systemControlHandler.getManifestData();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getMemoryInfo'),
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getMemoryInfo() {
    return this.systemControlHandler.getMemoryInfo();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getStatus'),
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
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
  @OtelMethodCounter()
  async getSystemProperties() {
    return this.systemControlHandler.getSystemProperties();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restart'),
  )
  @RpcAuth(`system-control:write@auth`)
  @OtelMethodCounter()
  async restart() {
    return this.systemControlHandler.restart();
  }
}

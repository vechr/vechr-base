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
    'Shutdown the application',
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
    'Get configuration',
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
    'Get configuration names',
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
    'Get configuration parameter',
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
    'Get control list',
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
    'Get manifest data',
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getManifestData() {
    return this.systemControlHandler.getManifestData();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getMemoryInfo'),
    'Get memory info',
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getMemoryInfo() {
    return this.systemControlHandler.getMemoryInfo();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'getStatus'),
    'Get service status',
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
    'Get detailed system info',
  )
  @RpcAuth(`system-control:read@auth`)
  @OtelMethodCounter()
  async getSystemProperties() {
    return this.systemControlHandler.getSystemProperties();
  }

  @LoggedMessagePattern(
    SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restart'),
    'Restart the application',
  )
  @RpcAuth(`system-control:write@auth`)
  @OtelMethodCounter()
  async restart() {
    return this.systemControlHandler.restart();
  }
}

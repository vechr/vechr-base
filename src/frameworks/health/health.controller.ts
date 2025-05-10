import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  @ApiOperation({
    summary: 'This method is to check health of the application',
  })
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  check() {
    return this.healthService.healthCheck();
  }

  @Version(VERSION_NEUTRAL)
  @Get()
  @ApiOperation({
    summary: 'This method is to check health of the application',
  })
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  check2() {
    return this.healthService.healthCheck();
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('info')
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('config/database')
  getDatabaseConfig() {
    return this.appService.getDatabaseConfig();
  }

  @Get('config/cache')
  getCacheConfig() {
    return this.appService.getCacheConfig();
  }

  @Get('config/logging')
  getLoggingConfig() {
    return this.appService.getLoggingConfig();
  }
} 
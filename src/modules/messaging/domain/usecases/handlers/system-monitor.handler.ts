import { Injectable } from '@nestjs/common';
import { MessagingHandler } from './messaging.handler';
import { HealthService } from '@/frameworks/health/health.service';
import { log } from '@/frameworks';
import { SYSTEM_MONITOR_MESSAGE_TYPE } from './constant.handler';
import { RegisterControl } from '../../../../../frameworks/shared/decorators/register-control.decorator';

interface IHealthResponse {
  data: {
    status: string;
    health?: any;
  };
}

@Injectable()
export class SystemMonitorHandler extends MessagingHandler {
  constructor(private readonly healthService: HealthService) {
    super();
  }

  @RegisterControl(
    SYSTEM_MONITOR_MESSAGE_TYPE,
    'health',
    'Performs a health check on the system and returns the status',
  )
  public async health() {
    try {
      log.info('Executing health check command');

      const healthStatus = await this.healthService.healthCheck();

      const response = this.createSuccessResponse<IHealthResponse['data']>(
        'Health check completed successfully',
        {
          status: 'ok',
          health: healthStatus,
        },
      );

      log.info('Health check command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to perform health check',
        err,
      );
      log.error('Health check command error', { error: err });
      return errorResponse;
    }
  }
}

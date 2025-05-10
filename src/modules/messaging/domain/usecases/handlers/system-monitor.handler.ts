import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';
import { Injectable } from '@nestjs/common';
import { MessagingHandler } from './messaging.handler';
import { HealthService } from '@/frameworks/health/health.service';
import { log } from '@/frameworks';
import { SYSTEM_MONITOR_MESSAGE_TYPE } from './constant.handler';
interface IHealthResponse {
  data: {
    status: string;
    health?: any;
  };
}

@Injectable()
export class SystemMonitorHandler extends MessagingHandler {
  constructor(
    private readonly healthService: HealthService,
    handlerRegistry: HandlerRegistryService,
  ) {
    super(handlerRegistry);
    this.registrationControls(SYSTEM_MONITOR_MESSAGE_TYPE);
  }

  protected override methods: { name: string; description: string }[] = [
    { name: 'health', description: 'Check the health status of the gateway' },
  ];

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

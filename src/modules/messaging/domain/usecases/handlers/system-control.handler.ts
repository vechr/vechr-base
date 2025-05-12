import { log } from '@/frameworks';
import fs from 'fs';
import path from 'path';
import {
  IMessagingAdapter,
  MESSAGING_ADAPTER,
} from '@/modules/messaging/domain/entities/messaging-adapter.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as os from 'os';
import { ConfigRegistryService } from '@/modules/messaging/domain/usecases/services/config-registry.service';
import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';
import { MessagingHandler } from './messaging.handler';
import { SubjectFactory } from '../factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from './constant.handler';
import {
  GetConfigurationValidator,
  GetConfigurationParameterValidator,
  GetControlListValidator,
} from '../entities/system-control.validator';

@Injectable()
export class SystemControlHandler extends MessagingHandler {
  constructor(
    @Inject(MESSAGING_ADAPTER)
    private readonly messagingAdapter: IMessagingAdapter,
    private readonly configRegistry: ConfigRegistryService,
    handlerRegistry: HandlerRegistryService,
  ) {
    super(handlerRegistry);

    this.registrationControls(SYSTEM_CONTROL_MESSAGE_TYPE);
  }

  /**
   * Register all system control methods with the global registry
   */
  protected override methods: { name: string; description: string }[] = [
    { name: 'exit', description: 'Shutdown the application' },
    { name: 'getActivity', description: 'Configure heartbeat' },
    { name: 'getConfiguration', description: 'Get configuration text' },
    { name: 'getConfigurationNames', description: 'Get configuration names' },
    {
      name: 'getConfigurationParameter',
      description: 'Get configuration parameter',
    },
    { name: 'getControlList', description: 'Get system control info' },
    { name: 'getLogInfo', description: 'Get recent log entries' },
    { name: 'getManifestData', description: 'Get manifest information' },
    { name: 'getMemoryInfo', description: 'Get memory usage' },
    { name: 'getStatus', description: 'Get service status' },
    { name: 'getSystemProperties', description: 'Get detailed system info' },
    { name: 'restart', description: 'Restart the application' },
  ];

  // Format bytes to human-readable format (KB, MB, GB)
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.floor(seconds);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  // Get package.json data for manifest info
  private async getPackageInfo(): Promise<any> {
    try {
      const pkgPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkgData = fs.readFileSync(pkgPath, 'utf8');
        return JSON.parse(pkgData);
      }
      return null;
    } catch (err) {
      log.error('Failed to read package.json', { error: err });
      return null;
    }
  }

  public async exit() {
    try {
      log.info('Executing exit command');

      // Publish an event before exiting
      await this.messagingAdapter.publish(
        SubjectFactory.buildSubject(this.messageType, 'exiting'),
        {
          timestamp: new Date().toISOString(),
          message: 'Application is shutting down',
        },
      );

      const response = this.createSuccessResponse(
        'Application is shutting down',
        {
          message: 'Application is shutting down',
        },
      );

      log.info('Exit command response', { response });

      // Schedule the exit after response is sent
      setTimeout(() => {
        process.exit(0);
      }, 500);

      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to execute exit command',
        err,
      );
      log.error('Exit command error', { error: err });
      return errorResponse;
    }
  }

  public async getConfiguration(data: GetConfigurationValidator) {
    try {
      log.info('Executing getConfiguration command', {
        name: data.name,
      });

      const configName = data.name || 'default';
      let config = {};

      if (configName === 'default' || configName === 'environment') {
        const safeEnv = { ...process.env };
        Object.keys(safeEnv).forEach((key) => {
          if (key.match(/password|secret|key|token/i)) {
            safeEnv[key] = '******';
          }
        });
        config = safeEnv;
      } else if (configName === 'system') {
        config = {
          os: {
            platform: process.platform,
            arch: process.arch,
            version: os.version(),
            release: os.release(),
            hostname: os.hostname(),
          },
          node: {
            version: process.version,
            versions: process.versions,
          },
        };
      }

      const response = this.createSuccessResponse(
        'Configuration retrieved successfully',
        {
          configName,
          config,
        },
      );

      log.info('GetConfiguration command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get configuration',
        err,
      );
      log.error('GetConfiguration command error', { error: err });
      return errorResponse;
    }
  }

  public async getConfigurationNames() {
    try {
      log.info('Executing getConfigurationNames command');

      const configNames = this.configRegistry.getAllConfigKeys();
      const response = this.createSuccessResponse(
        'Configuration names retrieved successfully',
        {
          configNames,
        },
      );

      log.info('GetConfigurationNames command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get configuration names',
        err,
      );
      log.error('GetConfigurationNames command error', { error: err });
      return errorResponse;
    }
  }

  public async getConfigurationParameter(
    data: GetConfigurationParameterValidator,
  ) {
    try {
      log.info('Executing getConfigurationParameter command', {
        paramName: data.paramName,
      });

      if (!data.paramName) {
        throw new Error('Parameter name is required');
      }

      const paramName = data.paramName;
      let paramValue;

      if (process.env[paramName] !== undefined) {
        if (paramName.match(/password|secret|key|token/i)) {
          paramValue = '******';
        } else {
          paramValue = process.env[paramName];
        }
      }

      const response = this.createSuccessResponse(
        'Configuration parameter retrieved successfully',
        {
          paramName,
          paramValue,
        },
      );

      log.info('GetConfigurationParameter command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get configuration parameter',
        err,
      );
      log.error('GetConfigurationParameter command error', { error: err });
      return errorResponse;
    }
  }

  public async getControlList(data: GetControlListValidator) {
    try {
      log.info('Executing getControlList command', {
        handlerType: data.handlerType,
      });

      // Get controls from the global registry
      const allControls = this.handlerRegistry.getAllControls();

      // Handle filtering by handler type if requested
      let filteredControls = { ...allControls };
      if (data.handlerType && typeof data.handlerType === 'string') {
        const handlerType = data.handlerType;
        const handlerControls =
          this.handlerRegistry.getControlsForHandler(handlerType);

        if (handlerControls.length > 0) {
          filteredControls = { [handlerType]: handlerControls };
        }
      }

      const response = this.createSuccessResponse(
        'Control list retrieved successfully',
        {
          controls: filteredControls,
          totalCommands: this.handlerRegistry.getTotalControlCount(),
          handlerTypes: this.handlerRegistry.getHandlerTypes(),
        },
      );

      log.info('GetControlList command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get control list',
        err,
      );
      log.error('GetControlList command error', { error: err });
      return errorResponse;
    }
  }

  public async getManifestData() {
    try {
      log.info('Executing getManifestData command');

      const packageInfo = await this.getPackageInfo();

      const response = this.createSuccessResponse(
        'Manifest data retrieved successfully',
        {
          application: {
            name: packageInfo?.name || 'base-service',
            version: packageInfo?.version || '1.0.0',
            description: packageInfo?.description || 'Vehcr Baseline Service',
            dependencies: packageInfo?.dependencies || {},
          },
        },
      );

      log.info('GetManifestData command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get manifest data',
        err,
      );
      log.error('GetManifestData command error', { error: err });
      return errorResponse;
    }
  }

  public async getMemoryInfo() {
    try {
      log.info('Executing getMemoryInfo command');

      const memoryUsage = process.memoryUsage();

      const response = this.createSuccessResponse(
        'Memory info retrieved successfully',
        {
          memory: {
            heapTotal: this.formatBytes(memoryUsage.heapTotal),
            heapUsed: this.formatBytes(memoryUsage.heapUsed),
            rss: this.formatBytes(memoryUsage.rss),
            external: memoryUsage.external
              ? this.formatBytes(memoryUsage.external)
              : undefined,
            arrayBuffers: memoryUsage.arrayBuffers
              ? this.formatBytes(memoryUsage.arrayBuffers)
              : undefined,
            heapUsedPercentage:
              ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(
                2,
              ) + '%',
            systemTotal: this.formatBytes(os.totalmem()),
            systemFree: this.formatBytes(os.freemem()),
            systemUsedPercentage:
              (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(
                2,
              ) + '%',
          },
          raw: {
            process: memoryUsage,
            system: {
              total: os.totalmem(),
              free: os.freemem(),
            },
          },
        },
      );

      log.info('GetMemoryInfo command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get memory info',
        err,
      );
      log.error('GetMemoryInfo command error', { error: err });
      return errorResponse;
    }
  }

  public async getStatus() {
    try {
      log.info('Executing getStatus command');

      const response = this.createSuccessResponse(
        'Status retrieved successfully',
        {
          status: 'running',
          gateway: {
            type: 'default',
            status: 'connected',
          },
          messaging: {
            type: this.messagingAdapter.constructor.name,
            status: 'connected',
          },
          uptime: this.formatUptime(process.uptime()),
          uptimeRaw: process.uptime(),
          startTime: new Date(
            Date.now() - process.uptime() * 1000,
          ).toISOString(),
          heartbeat: {
            active: true,
            period: 5000,
            periodFormatted: this.formatUptime(5),
          },
        },
      );

      log.info('GetStatus command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get status',
        err,
      );
      log.error('GetStatus command error', { error: err });
      return errorResponse;
    }
  }

  public async getSystemProperties() {
    try {
      log.info('Executing getSystemProperties command');

      const memoryUsage = process.memoryUsage();
      const response = this.createSuccessResponse(
        'System properties retrieved successfully',
        {
          process: {
            pid: process.pid,
            uptime: this.formatUptime(process.uptime()),
            memoryUsage: {
              heapTotal: this.formatBytes(memoryUsage.heapTotal),
              heapUsed: this.formatBytes(memoryUsage.heapUsed),
              rss: this.formatBytes(memoryUsage.rss),
            },
            nodeVersion: process.version,
            env: process.env.NODE_ENV,
          },
          os: {
            platform: process.platform,
            arch: process.arch,
            hostname: os.hostname(),
            totalMemory: this.formatBytes(os.totalmem()),
            freeMemory: this.formatBytes(os.freemem()),
            usedMemoryPercentage:
              (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(
                2,
              ) + '%',
            cpuCount: os.cpus().length,
          },
          gateway: {
            type: 'default',
            status: 'connected',
          },
          messaging: {
            type: this.messagingAdapter.constructor.name,
            status: 'connected',
          },
        },
      );

      log.info('GetSystemProperties command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to get system properties',
        err,
      );
      log.error('GetSystemProperties command error', { error: err });
      return errorResponse;
    }
  }

  public async restart() {
    try {
      log.info('Executing restart command');

      // Publish an event before restarting
      await this.messagingAdapter.publish(
        SubjectFactory.buildSubject(this.messageType, 'restarting'),
        {
          timestamp: new Date().toISOString(),
          message: 'Application is restarting',
        },
      );

      const response = this.createSuccessResponse('Application is restarting', {
        message: 'Application is restarting',
      });

      log.info('Restart command response', { response });

      // Schedule the restart after response is sent
      setTimeout(() => {
        process.exit(0);
      }, 500);

      return response;
    } catch (err: any) {
      const errorResponse = this.createErrorResponse(
        'Failed to restart application',
        err,
      );
      log.error('Restart command error', { error: err });
      return errorResponse;
    }
  }
}

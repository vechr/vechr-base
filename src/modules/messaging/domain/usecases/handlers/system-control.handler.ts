import {
  ConfigCollectorService,
  ErrorResponse,
  log,
  SuccessResponse,
} from '@/frameworks';
import fs from 'fs';
import path from 'path';
import {
  IMessagingAdapter,
  MESSAGING_ADAPTER,
} from '@/modules/messaging/domain/entities/messaging-adapter.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as os from 'os';
import { SubjectFactory } from '../factories/subject.factory';
import { SYSTEM_CONTROL_MESSAGE_TYPE } from './constant.handler';
import {
  GetConfigurationValidator,
  GetConfigurationParameterValidator,
  GetControlListValidator,
} from '../entities/system-control.validator';
import { MethodCollectorService } from '@/frameworks/data-services/method-collector/method-collector.service';

@Injectable()
export class SystemControlHandler {
  constructor(
    @Inject(MESSAGING_ADAPTER)
    private readonly messagingAdapter: IMessagingAdapter,
    private readonly configCollector: ConfigCollectorService,
    private readonly methodCollectorService: MethodCollectorService,
  ) {}

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
      // Publish an event before exiting
      await this.messagingAdapter.publish(
        SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'exiting'),
        {
          timestamp: new Date().toISOString(),
          message: 'Application is shutting down',
        },
      );

      const response = new SuccessResponse('Application is shutting down', {
        message: 'Application is shutting down',
      });

      // Schedule the exit after response is sent
      setTimeout(() => {
        process.exit(0);
      }, 500);

      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to execute exit command',
        err,
      );
      log.error('Exit command error', { error: err });
      return errorResponse;
    }
  }

  public async getConfiguration(data: GetConfigurationValidator) {
    try {
      const configName = data?.name || 'default';
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

      const response = new SuccessResponse(
        'Configuration retrieved successfully',
        {
          configName,
          config,
        },
      );
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to get configuration',
        err,
      );
      log.error('GetConfiguration command error', { error: err });
      return errorResponse;
    }
  }

  public async getConfigurationNames() {
    try {
      const configNames = this.configCollector.getAllConfigKeys();
      const response = new SuccessResponse(
        'Configuration names retrieved successfully',
        {
          configNames,
        },
      );

      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
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

      const response = new SuccessResponse(
        'Configuration parameter retrieved successfully',
        {
          paramName,
          paramValue,
        },
      );
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to get configuration parameter',
        err,
      );
      log.error('GetConfigurationParameter command error', { error: err });
      return errorResponse;
    }
  }

  public async getControlList(data: GetControlListValidator) {
    try {
      // Get controls from the method collector service
      const allControlGroups = this.methodCollectorService.getControlGroups();
      const allControls = this.methodCollectorService.getAllControls();

      // Format the response to maintain backward compatibility
      const formattedControls: Record<string, any[]> = {};

      // Handle filtering by handler type if requested
      if (data?.handlerType && typeof data?.handlerType === 'string') {
        const handlerType = data.handlerType;
        const controlGroup =
          this.methodCollectorService.getControlGroup(handlerType);

        if (controlGroup) {
          formattedControls[handlerType] = controlGroup.controls.map(
            (control) => ({
              name: control.name,
              description: control.description,
              handler: handlerType,
              subject: SubjectFactory.buildSubject(handlerType, control.name),
            }),
          );
        }
      } else {
        // No filter, include all controls
        allControlGroups.forEach((group) => {
          formattedControls[group.controlName] = group.controls.map(
            (control) => ({
              name: control.name,
              description: control.description,
              handler: group.controlName,
              subject: SubjectFactory.buildSubject(
                group.controlName,
                control.name,
              ),
            }),
          );
        });
      }

      const response = new SuccessResponse(
        'Control list retrieved successfully',
        {
          controls: formattedControls,
          totalCommands: allControls.length,
          handlerTypes: allControlGroups.map((group) => group.controlName),
        },
      );
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to get control list',
        err,
      );
      log.error('GetControlList command error', { error: err });
      return errorResponse;
    }
  }

  public async getManifestData() {
    try {
      const packageInfo = await this.getPackageInfo();

      const response = new SuccessResponse(
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
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to get manifest data',
        err,
      );
      log.error('GetManifestData command error', { error: err });
      return errorResponse;
    }
  }

  public async getMemoryInfo() {
    try {
      const memoryUsage = process.memoryUsage();

      const response = new SuccessResponse(
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
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse('Failed to get memory info', err);
      log.error('GetMemoryInfo command error', { error: err });
      return errorResponse;
    }
  }

  public async getStatus() {
    try {
      const response = new SuccessResponse('Status retrieved successfully', {
        status: 'running',
        messaging: {
          type: this.messagingAdapter.constructor.name,
          status: 'connected',
        },
        uptime: this.formatUptime(process.uptime()),
        uptimeRaw: process.uptime(),
        startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
        heartbeat: {
          active: true,
          period: 5000,
          periodFormatted: this.formatUptime(5),
        },
      });
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse('Failed to get status', err);
      log.error('GetStatus command error', { error: err });
      return errorResponse;
    }
  }

  public async getSystemProperties() {
    try {
      const memoryUsage = process.memoryUsage();
      const response = new SuccessResponse(
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
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to get system properties',
        err,
      );
      log.error('GetSystemProperties command error', { error: err });
      return errorResponse;
    }
  }

  public async restart() {
    try {
      // Publish an event before restarting
      await this.messagingAdapter.publish(
        SubjectFactory.buildSubject(SYSTEM_CONTROL_MESSAGE_TYPE, 'restarting'),
        {
          timestamp: new Date().toISOString(),
          message: 'Application is restarting',
        },
      );

      const response = new SuccessResponse('Application is restarting', {
        message: 'Application is restarting',
      });
      // Schedule the restart after response is sent
      setTimeout(() => {
        process.exit(0);
      }, 500);

      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to restart application',
        err,
      );
      log.error('Restart command error', { error: err });
      return errorResponse;
    }
  }
}

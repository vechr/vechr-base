import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../data-services/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  public async healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck('prisma-database', this.prisma, {
          timeout: 3000,
        }),
    ]);
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  MethodRegistry,
  ControlGroupList,
  Control,
  ControlGroup,
} from './method-registry.service';
import { log } from '@/frameworks/shared/utils';
import { COLLECTED_METHOD_KEY } from '@/frameworks/shared/decorators/method-collector.decorator';

/**
 * Service that provides functionality to interact with collected methods
 */
@Injectable()
export class MethodCollectorService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  /**
   * On module initialization, scan for methods with the CollectMethod decorator
   * This ensures that all methods are collected even if they haven't been called yet
   */
  onModuleInit() {
    this.scanForCollectedMethods();
  }

  /**
   * Scan all providers for methods with the CollectMethod decorator
   */
  private scanForCollectedMethods() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();

    [...providers, ...controllers].forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') {
        return;
      }

      this.scanInstance(instance);
    });
  }

  /**
   * Scan an instance for methods with the CollectMethod decorator
   */
  private scanInstance(instance: Record<string, any>) {
    const prototype = Object.getPrototypeOf(instance);
    const className = prototype.constructor.name;

    this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (methodName: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          prototype,
          methodName,
        );
        if (!descriptor) {
          return;
        }

        const metadata = Reflect.getMetadata(
          COLLECTED_METHOD_KEY,
          prototype,
          methodName,
        );
        if (metadata) {
          // The method is already registered through the decorator execution,
          // but we might want to add additional context here if needed
          log.info(
            `Found decorated method: ${className}.${methodName} with controlName: ${metadata.controlName}`,
          );
        }
      },
    );
  }

  /**
   * Get all control groups
   */
  getControlGroups(): ControlGroupList {
    return MethodRegistry.getControlGroups();
  }

  /**
   * Get a specific control group by name
   */
  getControlGroup(controlName: string): ControlGroup | undefined {
    return MethodRegistry.getControlGroup(controlName);
  }

  /**
   * Get all controls from all groups
   */
  getAllControls(): Control[] {
    return MethodRegistry.getAllControls();
  }

  /**
   * Get method implementation details
   */
  getMethodImplementation(controlName: string, methodName: string) {
    return MethodRegistry.getMethodImplementation(controlName, methodName);
  }

  /**
   * Invoke a method by control name and method name
   * @param controlName Control group name
   * @param methodName Method name within the control group
   * @param args Arguments to pass to the method
   * @returns The result of the method invocation
   */
  invokeMethod(controlName: string, methodName: string, ...args: any[]) {
    const implementation = this.getMethodImplementation(
      controlName,
      methodName,
    );
    if (!implementation) {
      throw new Error(
        `Method ${methodName} not found in control group ${controlName}`,
      );
    }

    const { target, descriptor } = implementation;
    const instance = new target.constructor();
    return descriptor.value.apply(instance, args);
  }
}

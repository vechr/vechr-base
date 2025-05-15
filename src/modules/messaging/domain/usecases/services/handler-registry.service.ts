import { Injectable, Scope } from '@nestjs/common';
import { log } from '@/frameworks/shared/utils';

export interface ControlItem {
  name: string;
  description: string;
  handler: string;
}

/**
 * Global Control Registry Service
 *
 * Keeps track of all available control methods across different handlers.
 * Handlers can register their available methods, and the SystemControlHandler
 * can retrieve the complete list.
 */
@Injectable({ scope: Scope.DEFAULT })
export class HandlerRegistryService {
  // Static instance to ensure we always use the same instance
  private static instance: HandlerRegistryService;

  // Using a private property with a public getter ensures we can track
  // modifications to the controls map
  private _controls: Map<string, ControlItem[]> = new Map();

  constructor() {
    // Ensure we only have one instance of the HandlerRegistryService
    if (HandlerRegistryService.instance) {
      log.debug('Returning existing HandlerRegistryService instance');
      return HandlerRegistryService.instance;
    }

    log.debug('Creating new HandlerRegistryService instance');
    HandlerRegistryService.instance = this;
  }

  // Getter to allow debugging of the controls map
  get controls(): Map<string, ControlItem[]> {
    return this._controls;
  }

  /**
   * Register a control method
   *
   * @param handlerType The type of handler (SystemControl, Command, etc.)
   * @param name The name of the control method
   * @param description A description of what the control method does
   */
  registerControl(
    handlerType: string,
    name: string,
    description: string,
  ): void {
    log.debug(`Registering control: ${handlerType}.${name} - ${description}`);

    if (!this._controls.has(handlerType)) {
      this._controls.set(handlerType, []);
      log.debug(`Created new control group for handler type: ${handlerType}`);
    }

    // Check if control already exists to avoid duplicates
    const existingControls = this._controls.get(handlerType) || [];
    const exists = existingControls.some((control) => control.name === name);

    if (!exists) {
      log.debug(`Adding control ${name} to handler ${handlerType}`);
      existingControls.push({
        name,
        description,
        handler: handlerType,
      });

      this._controls.set(handlerType, existingControls);

      // After setting, verify the control was actually added
      const verifyControls = this._controls.get(handlerType) || [];
      log.debug(
        `Verification: handler ${handlerType} now has ${verifyControls.length} controls`,
      );
    } else {
      log.debug(
        `Control ${name} already exists for handler ${handlerType} - skipping`,
      );
    }
  }

  /**
   * Register multiple controls at once
   *
   * @param handlerType The type of handler
   * @param controls Array of control items to register
   */
  registerControls(
    handlerType: string,
    controls: Array<{ name: string; description: string }>,
  ): void {
    log.debug(
      `Registering ${controls.length} controls for handler ${handlerType}`,
    );
    controls.forEach((control) => {
      this.registerControl(handlerType, control.name, control.description);
    });
  }

  /**
   * Get all registered controls
   *
   * @returns Map of handler types to control arrays
   */
  getAllControls(): Record<string, ControlItem[]> {
    const result: Record<string, ControlItem[]> = {};

    this._controls.forEach((controls, handlerType) => {
      result[handlerType] = [...controls];
    });

    log.debug(
      `getAllControls - found ${Object.keys(result).length} handler types with controls`,
    );
    Object.keys(result).forEach((handlerType) => {
      log.debug(`  - ${handlerType}: ${result[handlerType].length} controls`);
    });

    return result;
  }

  /**
   * Get controls for a specific handler type
   *
   * @param handlerType The type of handler to get controls for
   * @returns Array of control items for the handler
   */
  getControlsForHandler(handlerType: string): ControlItem[] {
    const controls = this._controls.get(handlerType) || [];
    log.debug(
      `getControlsForHandler(${handlerType}) - found ${controls.length} controls`,
    );
    return controls;
  }

  /**
   * Get the count of all registered controls
   */
  getTotalControlCount(): number {
    let total = 0;
    this._controls.forEach((controls) => {
      total += controls.length;
    });
    log.debug(`getTotalControlCount() - found ${total} total controls`);
    return total;
  }

  /**
   * Get the list of all handler types that have registered controls
   */
  getHandlerTypes(): string[] {
    const types = Array.from(this._controls.keys());
    log.debug(`getHandlerTypes() - found ${types.length} handler types`);
    return types;
  }

  /**
   * Debug method to dump the current state of controls to the log
   */
  dumpControls(): void {
    log.info('=== CONTROL REGISTRY DUMP ===');
    log.info(`Total handler types: ${this.getHandlerTypes().length}`);
    log.info(`Total controls: ${this.getTotalControlCount()}`);

    this._controls.forEach((controls, handlerType) => {
      log.info(`Handler: ${handlerType} (${controls.length} controls)`);
      controls.forEach((control) => {
        log.info(`  - ${control.name}: ${control.description}`);
      });
    });

    log.info('=== END CONTROL REGISTRY DUMP ===');
  }

  /**
   * Clear all registered controls
   * Mostly used for testing
   */
  clearAllControls(): void {
    log.debug('Clearing all controls from registry');
    this._controls.clear();
  }
}

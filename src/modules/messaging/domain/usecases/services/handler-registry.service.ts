import { Injectable } from '@nestjs/common';

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
@Injectable()
export class HandlerRegistryService {
  private controls: Map<string, ControlItem[]> = new Map();

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
    if (!this.controls.has(handlerType)) {
      this.controls.set(handlerType, []);
    }

    // Check if control already exists to avoid duplicates
    const existingControls = this.controls.get(handlerType) || [];
    const exists = existingControls.some((control) => control.name === name);

    if (!exists) {
      existingControls.push({
        name,
        description,
        handler: handlerType,
      });

      this.controls.set(handlerType, existingControls);
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

    this.controls.forEach((controls, handlerType) => {
      result[handlerType] = [...controls];
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
    return this.controls.get(handlerType) || [];
  }

  /**
   * Get the count of all registered controls
   */
  getTotalControlCount(): number {
    let total = 0;
    this.controls.forEach((controls) => {
      total += controls.length;
    });
    return total;
  }

  /**
   * Get the list of all handler types that have registered controls
   */
  getHandlerTypes(): string[] {
    return Array.from(this.controls.keys());
  }

  /**
   * Clear all registered controls
   * Mostly used for testing
   */
  clearAllControls(): void {
    this.controls.clear();
  }
}

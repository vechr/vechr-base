export interface Control {
  name: string; // name of the method from the actual method name
  description: string; // description of the method, which we put in the decorator
}

export interface ControlGroup {
  controlName: string; // name of the control, which we put in the decorator
  controls: Control[]; // list of method metadata
}

// Example array type:
export type ControlGroupList = ControlGroup[];

// In-memory store for all collected methods
export class MethodRegistry {
  private static controlGroups: ControlGroupList = [];
  private static methodMap = new Map<
    string,
    { target: any; methodName: string; descriptor: PropertyDescriptor }
  >();

  /**
   * Register a method in the registry
   */
  static registerMethod(
    controlName: string,
    description: string,
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ): void {
    let group = this.controlGroups.find((g) => g.controlName === controlName);

    if (!group) {
      group = {
        controlName,
        controls: [],
      };
      this.controlGroups.push(group);
    }

    group.controls.push({
      name: methodName, // Use the actual method name
      description,
    });

    // Store method implementation details separately
    const key = `${controlName}:${methodName}`;
    this.methodMap.set(key, { target, methodName, descriptor });
  }

  /**
   * Get all control groups
   */
  static getControlGroups(): ControlGroupList {
    return [...this.controlGroups];
  }

  /**
   * Get control group by name
   */
  static getControlGroup(controlName: string): ControlGroup | undefined {
    return this.controlGroups.find((g) => g.controlName === controlName);
  }

  /**
   * Get all controls from all groups
   */
  static getAllControls(): Control[] {
    return this.controlGroups.flatMap((group) => group.controls);
  }

  /**
   * Get method implementation details by control name and method name
   */
  static getMethodImplementation(
    controlName: string,
    methodName: string,
  ):
    | { target: any; methodName: string; descriptor: PropertyDescriptor }
    | undefined {
    return this.methodMap.get(`${controlName}:${methodName}`);
  }

  /**
   * Clear all methods (mainly for testing purposes)
   */
  static clear(): void {
    this.controlGroups = [];
    this.methodMap.clear();
  }
}

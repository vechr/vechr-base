/**
 * Global Configuration Registry Service
 *
 * Stores and organizes all configuration keys by category.
 * This provides a centralized way to access configuration metadata.
 */
export class ConfigRegistry {
  private static configKeys: Record<string, any> = {};

  /**
   * Get all configuration keys organized by category
   */
  static getAllConfigKeys(): Record<string, any> {
    return { ...this.configKeys };
  }

  /**
   * Get configuration keys for a specific category
   */
  static getConfigKeysForCategory(category: string): any {
    return this.configKeys[category] || {};
  }

  /**
   * Add or update a configuration key to the registry
   */
  static addConfigKey(
    category: string,
    subcategory: string | null,
    value: any,
  ): void {
    if (!this.configKeys[category]) {
      this.configKeys[category] = subcategory ? {} : [];
    }

    if (subcategory) {
      if (!this.configKeys[category][subcategory]) {
        this.configKeys[category][subcategory] = [];
      }

      if (!this.configKeys[category][subcategory].includes(value)) {
        this.configKeys[category][subcategory].push(value);
      }
    } else {
      if (
        Array.isArray(this.configKeys[category]) &&
        !this.configKeys[category].includes(value)
      ) {
        this.configKeys[category].push(value);
      }
    }
  }

  /**
   * Clear all registered configuration keys
   */
  static clear(): void {
    this.configKeys = {};
  }
}

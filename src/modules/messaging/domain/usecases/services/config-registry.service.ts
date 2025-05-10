import { BaseConfig } from '@/config';
import baseConfig from '@/config/base.config';
import { Injectable } from '@nestjs/common';

/**
 * Global Configuration Registry Service
 *
 * Stores and organizes all configuration keys by category.
 * This provides a centralized way to access configuration metadata.
 */
@Injectable()
export class ConfigRegistryService {
  protected configKeys: Record<string, any> = {};
  protected initialized: boolean = false;

  constructor() {
    this.initialize(baseConfig);
  }

  /**
   * Initialize the registry with configuration from various sources
   */
  initialize(baseConfig: BaseConfig): void {
    if (this.initialized) {
      return;
    }

    this.configKeys = {
      // Extract all configuration sections
      app: this.extractConfigKeys(baseConfig.app, ''),
      cookie: this.extractConfigKeys(baseConfig.cookie, ''),
      nats: this.extractConfigKeys(baseConfig.nats, ''),
      jwt: this.extractConfigKeys(baseConfig.jwt, ''),
      encryption: this.extractConfigKeys(baseConfig.encryption, ''),
      audit: this.extractConfigKeys(baseConfig.audit, ''),
      logging: this.extractConfigKeys(baseConfig.logging, ''),
      tracing: this.extractConfigKeys(baseConfig.tracing, ''),
      cache: this.extractConfigKeys(baseConfig.cache, ''),
      subject: this.extractConfigKeys(baseConfig.subject, ''),
      // Add system information categories
      system: ['os', 'node'],
    };

    this.initialized = true;
  }

  /**
   * Process a config object and its nested structure
   * @param obj The configuration object to process
   * @param category The category name (used for prefix mapping)
   * @returns Processed configuration structure
   */
  protected processConfigObject(obj: any, category: string): any {
    if (!obj) return {};

    const result: Record<string, any> = {};

    // Add type/common keys if they exist
    if (obj.type) {
      result.common = [`${category.toUpperCase()}_TYPE`];
    }

    // Process each property in the object
    for (const key of Object.keys(obj)) {
      if (key === 'type') continue; // Skip type as it's already handled

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // For nested objects, extract keys with appropriate prefix
        const prefix = this.getCategoryPrefix(category, key);
        result[key] = this.extractConfigKeys(obj[key], prefix);
      }
    }

    return result;
  }

  /**
   * Get the appropriate environment variable prefix for a category
   */
  protected getCategoryPrefix(category: string, subcategory: string): string {
    // Messaging-specific prefixes
    if (category === 'messaging') {
      if (subcategory === 'nats') return 'NATS_';
      if (subcategory === 'mqtt') return 'MQTT_';
    }

    // Default prefix is the upper-case category name
    return `${subcategory.toUpperCase()}_`;
  }

  /**
   * Extract configuration keys from an object and convert to environment variable format
   */
  protected extractConfigKeys(obj: any, prefix: string): string[] {
    if (!obj) return [];

    return Object.keys(obj).map((key) => {
      // Convert camelCase to UPPER_SNAKE_CASE
      const upperSnakeCase = key
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, '');

      return `${prefix}${upperSnakeCase}`;
    });
  }

  /**
   * Get all configuration keys organized by category
   */
  getAllConfigKeys(): Record<string, any> {
    return { ...this.configKeys };
  }

  /**
   * Get configuration keys for a specific category
   */
  getConfigKeysForCategory(category: string): any {
    return this.configKeys[category] || {};
  }

  /**
   * Add or update a configuration key to the registry
   */
  addConfigKey(
    category: string,
    subcategory: string | null,
    key: string,
  ): void {
    if (!this.configKeys[category]) {
      this.configKeys[category] = subcategory ? {} : [];
    }

    if (subcategory) {
      if (!this.configKeys[category][subcategory]) {
        this.configKeys[category][subcategory] = [];
      }

      if (!this.configKeys[category][subcategory].includes(key)) {
        this.configKeys[category][subcategory].push(key);
      }
    } else {
      if (
        Array.isArray(this.configKeys[category]) &&
        !this.configKeys[category].includes(key)
      ) {
        this.configKeys[category].push(key);
      }
    }
  }

  /**
   * Check if the registry has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

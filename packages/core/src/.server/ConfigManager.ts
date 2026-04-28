import { prisma } from "@repo/database";
import type { Prisma } from "@repo/database";

/**
 * Configuration cache entry with TTL
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Configuration scope types
 * - 'site': Site-wide configuration
 * - 'auth': Authentication configuration
 */
type ConfigScope = "site" | "auth";

/**
 * ConfigManager - Singleton class for managing database-backed configuration with TTL caching
 *
 * Features:
 * - TTL-based in-memory caching (1 second default)
 * - Lazy loading from database
 * - Default value support
 * - Type-safe configuration retrieval
 * - Scope-based configuration (site, auth)
 * - Module-specific configuration via getModule/setModule methods
 *
 * @example
 * ```typescript
 * const authLoginConfig = await configManager.get('auth', 'login', { phone: false, email: true, login_id: false });
 * const boardSettingsConfig = await configManager.getModule('board', 'settings', { postsPerPage: 20 });
 * ```
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly TTL_MS = 1000; // 1 second TTL

  private constructor() {}

  /**
   * Get the singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Generate cache key from scope and key
   */
  private getCacheKey(scope: string, key: string): string {
    return `${scope}:${key}`;
  }

  /**
   * Check if cache entry is still valid (within TTL)
   */
  private isCacheValid(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp < this.TTL_MS;
  }

  /**
   * Get configuration value from cache
   */
  private getFromCache<T>(scope: string, key: string): T | null {
    const cacheKey = this.getCacheKey(scope, key);
    const entry = this.cache.get(cacheKey);

    if (entry && this.isCacheValid(entry)) {
      return entry.value as T;
    }

    // Remove expired cache entry
    if (entry) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Set configuration value in cache
   */
  private setCache<T>(scope: string, key: string, value: T): void {
    const cacheKey = this.getCacheKey(scope, key);
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Fetch configuration from database
   */
  private async fetchFromDatabase<T>(
    scope: string,
    key: string,
  ): Promise<T | null> {
    const config = await prisma.configs.findUnique({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
      select: {
        value: true,
      },
    });

    if (config) {
      return config.value as T;
    }

    return null;
  }

  /**
   * Internal get configuration value with caching and default value support
   *
   * @param scope - Configuration scope (any string)
   * @param key - Configuration key
   * @param defaultValue - Default value to return if not found in database
   * @returns Configuration value or default value
   */
  private async _get<T>(
    scope: string,
    key: string,
    defaultValue: T,
  ): Promise<T> {
    // Try to get from cache first
    const cachedValue = this.getFromCache<T>(scope, key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Fetch from database
    const dbValue = await this.fetchFromDatabase<T>(scope, key);

    // Use database value if exists, otherwise use default
    const value = dbValue !== null ? dbValue : defaultValue;

    // Cache the value (whether from DB or default)
    this.setCache(scope, key, value);

    return value;
  }

  /**
   * Internal set configuration value in database and update cache
   *
   * @param scope - Configuration scope (any string)
   * @param key - Configuration key
   * @param value - Configuration value (will be stored as JSONB)
   * @param description - Optional description of the configuration
   */
  private async _set<T>(
    scope: string,
    key: string,
    value: T,
    description?: string,
  ): Promise<void> {
    await prisma.configs.upsert({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
      create: {
        scope,
        key,
        value: value as Prisma.InputJsonValue,
        description,
      },
      update: {
        value: value as Prisma.InputJsonValue,
        description,
        updated_at: new Date(),
      },
    });

    // Update cache
    this.setCache(scope, key, value);
  }

  /**
   * Get configuration value with caching and default value support
   * Automatically prefixes scope with 'core:'
   *
   * @param scope - Configuration scope (site, auth)
   * @param key - Configuration key
   * @param defaultValue - Default value to return if not found in database
   * @returns Configuration value or default value
   *
   * @example
   * ```typescript
   * const loginConfig = await configManager.get('auth', 'login', {
   *   phone: true,
   *   email: true,
   *   login_id: true
   * });
   * // Stored in database as scope='core:auth'
   * ```
   */
  public async get<T>(
    scope: ConfigScope,
    key: string,
    defaultValue: T,
  ): Promise<T> {
    const fullScope = `core:${scope}`;
    return this._get(fullScope, key, defaultValue);
  }

  /**
   * Set configuration value in database and update cache
   * Automatically prefixes scope with 'core:'
   *
   * @param scope - Configuration scope (site, auth)
   * @param key - Configuration key
   * @param value - Configuration value (will be stored as JSONB)
   * @param description - Optional description of the configuration
   *
   * @example
   * ```typescript
   * await configManager.set('auth', 'login', { phone: false, email: true, login_id: true }, 'Login method configuration');
   * // Stored in database as scope='core:auth'
   * ```
   */
  public async set<T>(
    scope: ConfigScope,
    key: string,
    value: T,
    description?: string,
  ): Promise<void> {
    const fullScope = `core:${scope}`;
    return this._set(fullScope, key, value, description);
  }

  /**
   * Delete cache for a specific configuration
   *
   * @param scope - Configuration scope (site, auth)
   * @param key - Configuration key
   *
   * @example
   * ```typescript
   * configManager.delete('auth', 'login');
   * ```
   */
  public delete(scope: ConfigScope, key: string): void {
    const fullScope = `core:${scope}`;
    const cacheKey = this.getCacheKey(fullScope, key);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear cache entries
   *
   * @example
   * ```typescript
   * configManager.clear();
   * ```
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get module-specific configuration value with caching and default value support
   *
   * @param moduleName - Module name (e.g., 'board')
   * @param key - Configuration key
   * @param defaultValue - Default value to return if not found in database
   * @returns Configuration value or default value
   *
   * @example
   * ```typescript
   * const boardConfig = await configManager.getModule('board', 'settings', {
   *   postsPerPage: 20,
   *   allowComments: true
   * });
   * ```
   */
  public async getModule<T>(
    moduleName: string,
    key: string,
    defaultValue: T,
  ): Promise<T> {
    const scope = `module:${moduleName}`;
    return this._get(scope, key, defaultValue);
  }

  /**
   * Set module-specific configuration value in database and update cache
   *
   * @param moduleName - Module name (e.g., 'board')
   * @param key - Configuration key
   * @param value - Configuration value (will be stored as JSONB)
   * @param description - Optional description of the configuration
   *
   * @example
   * ```typescript
   * await configManager.setModule('board', 'settings', {
   *   postsPerPage: 30,
   *   allowComments: false
   * }, 'Board module settings');
   * ```
   */
  public async setModule<T>(
    moduleName: string,
    key: string,
    value: T,
    description?: string,
  ): Promise<void> {
    const scope = `module:${moduleName}`;
    return this._set(scope, key, value, description);
  }

  /**
   * Delete cache for a module-specific configuration
   *
   * @param moduleName - Module name (e.g., 'board')
   * @param key - Configuration key
   *
   * @example
   * ```typescript
   * configManager.deleteModule('board', 'settings');
   * ```
   */
  public deleteModule(moduleName: string, key: string): void {
    const scope = `module:${moduleName}`;
    const cacheKey = this.getCacheKey(scope, key);
    this.cache.delete(cacheKey);
  }
}

// Export singleton instance for convenience
export const configManager = ConfigManager.getInstance();

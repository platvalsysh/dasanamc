import { configManager } from "@repo/core/server";
import type { SmsModuleConfig, SmsProfile } from "./types";

export const SMS_CONFIG_SCOPE = "config";
export const SMS_FAILOVER_CONFIG_SCOPE = "failover";

/**
 * Get the SMS Failover Configuration (Prefixes, etc.)
 */
export async function getSmsFailoverConfig(): Promise<Record<string, any>> {
  return configManager.getModule<Record<string, any>>("sms", SMS_FAILOVER_CONFIG_SCOPE, { persistentPrefix: "" });
}

/**
 * Save the SMS Failover Configuration
 */
export async function setSmsFailoverConfig(config: Record<string, any>): Promise<void> {
  await configManager.setModule("sms", SMS_FAILOVER_CONFIG_SCOPE, config, "SMS Failover Configuration");
}

/**
 * Get the full SMS Module Configuration
 */
export async function getSmsModuleConfig<ConfigType = Record<string, any>>(): Promise<SmsModuleConfig<ConfigType> | null> {
  return configManager.getModule<SmsModuleConfig<ConfigType> | null>("sms", SMS_CONFIG_SCOPE, null);
}

/**
 * Save the SMS Module Configuration
 */
export async function setSmsModuleConfig<ConfigType = Record<string, any>>(config: SmsModuleConfig<ConfigType>): Promise<void> {
  await configManager.setModule("sms", SMS_CONFIG_SCOPE, config, "SMS Provider Configuration");
}

/**
 * Resolve a profile name to its configuration
 * Handles default profile resolution
 */
export async function resolveSmsProfile<ConfigType = Record<string, any>>(profileName?: string): Promise<SmsProfile<ConfigType>> {
  const config = await getSmsModuleConfig<ConfigType>();
  
  if (!config || !config.profiles) {
    throw new Error("SMS Module is not configured.");
  }

  const targetProfileName = profileName || config.defaultProfile;
  const profile = config.profiles[targetProfileName];

  if (!targetProfileName || !profile) {
    throw new Error(`SMS Profile '${targetProfileName}' not found or default profile not set.`);
  }

  return profile;
}

/**
 * Add a new SMS profile
 */
export async function addSmsProfile(name: string, provider: string, initialConfig: Record<string, any> = {}): Promise<void> {
  const config = (await getSmsModuleConfig()) || { defaultProfile: "", profiles: {} };
  
  if (config.profiles[name]) {
    throw new Error(`Profile '${name}' already exists.`);
  }

  config.profiles[name] = {
    name,
    provider,
    config: initialConfig
  };

  if (!config.defaultProfile) {
    config.defaultProfile = name;
  }

  await setSmsModuleConfig(config);
}

/**
 * Update an existing SMS profile configuration
 */
export async function updateSmsProfileConfig<ConfigType = Record<string, any>>(profileName: string, newConfig: Partial<ConfigType>): Promise<void> {
  const config = await getSmsModuleConfig();
  if (!config || !config.profiles[profileName]) {
    throw new Error(`Profile '${profileName}' not found.`);
  }

  config.profiles[profileName].config = {
    ...config.profiles[profileName].config,
    ...newConfig
  };

  await setSmsModuleConfig(config);
}

/**
 * Delete an SMS profile
 */
export async function deleteSmsProfile(profileName: string): Promise<void> {
  const config = await getSmsModuleConfig();
  if (!config || !config.profiles[profileName]) {
    return;
  }

  delete config.profiles[profileName];

  if (config.defaultProfile === profileName) {
    const remaining = Object.keys(config.profiles);
    config.defaultProfile = remaining.length > 0 ? remaining[0] : "";
  }

  await setSmsModuleConfig(config);
}

/**
 * Set the default profile
 */
export async function setDefaultSmsProfile(profileName: string): Promise<void> {
  const config = await getSmsModuleConfig();
  if (!config || !config.profiles[profileName]) {
     throw new Error(`Profile '${profileName}' not found.`);
  }
  
  config.defaultProfile = profileName;
  await setSmsModuleConfig(config);
}

/**
 * Get SMS Test Environment Configuration
 */
export const getSmsTestConfig = () => {
    const isTestMode = process.env.SMS_TEST_MODE === "1";
    if (isTestMode) {
        const testNumber = process.env.SMS_TEST_NUMBER;
        if (!testNumber) {
            throw new Error("SMS_TEST_MODE is enabled but SMS_TEST_NUMBER is missing.");
        }
        return { mode: "test" as const, testNumber };
    }
    return { mode: "production" as const };
};

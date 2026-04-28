import type {
  KakaoMessage,
  LmsMessage,
  MmsMessage,
  ProviderCapabilities,
  SmsMessage,
} from "./types";
import { getSmsModuleConfig, resolveSmsProfile } from "./config";
import { ConsoleSmsProvider } from "./providers/ConsoleSmsProvider";
import { SolapiSmsProvider } from "./providers/SolapiSmsProvider";
import type { BaseSmsProvider } from "./providers/BaseSmsProvider";

type BaseSmsProviderConstructor = new (profileName?: string) => BaseSmsProvider;

interface ProviderInfo {
  ctor: BaseSmsProviderConstructor;
  provider: string;
  capabilities: ProviderCapabilities;
}

// Global Registry of Supported Providers
export const supportedProviders: Record<string, ProviderInfo> = {
  [ConsoleSmsProvider.provider]: {
    ctor: ConsoleSmsProvider,
    provider: ConsoleSmsProvider.provider,
    capabilities: ConsoleSmsProvider.capabilities,
  },
  [SolapiSmsProvider.provider]: {
    ctor: SolapiSmsProvider,
    provider: SolapiSmsProvider.provider,
    capabilities: SolapiSmsProvider.capabilities,
  },
};

export class SmsService {
  /**
   * Get list of configured profile names
   */
  async getProfiles(): Promise<string[]> {
    const config = await getSmsModuleConfig();
    if (!config || !config.profiles) {
      return [];
    }
    return Object.keys(config.profiles);
  }

  /**
   * Get list of supported provider names
   */
  getSupportedProviders(): string[] {
    return Object.keys(supportedProviders);
  }

  /**
   * Get capabilities of a specific provider
   */
  getProviderCapabilities(providerName: string): ProviderCapabilities {
    const definition = supportedProviders[providerName];
    if (!definition) return {};

    return definition.capabilities;
  }

  /**
   * Internal helper to get a provider instance configured with a profile
   */
  async getConfiguredProvider<T extends BaseSmsProvider = BaseSmsProvider>(
    profileName?: string,
  ): Promise<T> {
    const profile = await resolveSmsProfile(profileName);

    const definition = supportedProviders[profile.provider];
    if (!definition) {
      throw new Error(
        `Provider '${profile.provider}' for profile '${profile.name}' is not registered/supported.`,
      );
    }

    // Instantiate with the profile name (config will be loaded by the provider)
    return new definition.ctor(profile.name) as T;
  }

  /**
   * Wrapper to allow smsService.profile('name')
   */
  async profile<T extends BaseSmsProvider = BaseSmsProvider>(
    profileName: string,
  ): Promise<T> {
    const provider = await this.getConfiguredProvider<T>(profileName);
    return provider;
  }

  // Direct sends using default profile
  async send<T = Record<string, any>>(message: SmsMessage<T>): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.send(message);
  }

  async sendMany<T = Record<string, any>>(
    messages: SmsMessage<T>[],
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendMany(messages);
  }

  async sendLMS<T = Record<string, any>>(
    message: LmsMessage<T>,
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendLMS(message);
  }

  async sendLMSMany<T = Record<string, any>>(
    messages: LmsMessage<T>[],
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendLMSMany(messages);
  }

  async sendMMS<T = Record<string, any>>(
    message: MmsMessage<T>,
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendMMS(message);
  }

  async sendMMSMany<T = Record<string, any>>(
    messages: MmsMessage<T>[],
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendMMSMany(messages);
  }

  async sendKakao<T = Record<string, any>>(
    message: KakaoMessage<T>,
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendKakao(message);
  }

  async sendKakaoMany<T = Record<string, any>>(
    messages: KakaoMessage<T>[],
  ): Promise<void> {
    const provider = await this.getConfiguredProvider();
    return provider.sendKakaoMany(messages);
  }
}

export const smsService = new SmsService();

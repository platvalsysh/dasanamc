import { resolveSmsProfile } from "../config";
import type { SmsMessage, LmsMessage, MmsMessage, KakaoMessage, ProviderCapabilities, SmsProfile } from "../types";

/**
 * Abstract class for SMS providers to implement
 */
export abstract class BaseSmsProvider<ConfigType = Record<string, any>> {
  protected cachedProfile: SmsProfile<ConfigType> | null = null;
  
  constructor(protected profileName?: string) {}

  async getConfig(): Promise<ConfigType> {
    const profile = await this.getProfile();
    return profile.config as ConfigType;
  }

  async getProfile(): Promise<SmsProfile<ConfigType>> {
     if (this.cachedProfile) {
         return this.cachedProfile;
     }

     const profile = await resolveSmsProfile<ConfigType>(this.profileName);

     const provider = this.getProvider();
     if (profile.provider !== provider) {
         throw new Error(`Profile provider mismatch. Expected '${provider}', got '${profile.provider}'`);
     }

     this.cachedProfile = profile;
     return this.cachedProfile;
  }

  abstract getProvider(): string; /* e.g. 'console', 'solapi' */
  abstract getCapabilities(): ProviderCapabilities;

  abstract send<T = any>(message: SmsMessage<T>): Promise<void>;
  abstract sendMany<T = any>(messages: SmsMessage<T>[]): Promise<void>;

  abstract sendLMS<T = any>(message: LmsMessage<T>): Promise<void>;
  abstract sendLMSMany<T = any>(messages: LmsMessage<T>[]): Promise<void>;

  abstract sendMMS<T = any>(message: MmsMessage<T>): Promise<void>;
  abstract sendMMSMany<T = any>(messages: MmsMessage<T>[]): Promise<void>;

  abstract sendKakao<T = any>(message: KakaoMessage<T>): Promise<void>;
  abstract sendKakaoMany<T = any>(messages: KakaoMessage<T>[]): Promise<void>;
}

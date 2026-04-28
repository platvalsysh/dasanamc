export interface SmsMessage<T = Record<string, any>> {
  to: string; // Phone number
  text: string; // Message content
  from?: string; // Sender number (optional override)
  options?: T; // Provider specific options
}

export interface LmsMessage<T = Record<string, any>> extends SmsMessage<T> {
  title: string;
}

export interface MmsMessage<T = Record<string, any>> extends LmsMessage<T> {
  imageUrls: string[];
  imageId?: string; // For providers that require pre-uploaded image ID (e.g. Solapi)
}

export type RcsMessage<T = Record<string, any>> = SmsMessage<T>; // Base RCS type, extend as needed

/**
 * Configuration for the SMS provider
 * stored in ConfigManager
 */
/**
 * Configuration for a specific SMS profile
 */
export interface ProviderCapabilities {
  sms?: boolean;
  lms?: boolean;
  mms?: boolean;
  rcs?: boolean;
  kakao?: boolean;
}

export interface SmsProfile<ConfigType = Record<string, any>> {
  name: string;
  provider: string; // e.g. 'twilio', 'aligo', 'console'
  config: ConfigType;
}

/**
 * Root configuration for the SMS module
 */
export interface SmsModuleConfig<ConfigType = Record<string, any>> {
  defaultProfile: string; // Name of the default profile
  profiles: Record<string, SmsProfile<ConfigType>>; // Map of profile names to configs
}

export interface KakaoMessage<T = Record<string, any>> {
  to: string;
  text: string;
  templateId: string;
  type: "ATA" | "CTA";
  channelId: string; // Kakao Channel ID
  variables?: Record<string, string>;
  options?: T;
}



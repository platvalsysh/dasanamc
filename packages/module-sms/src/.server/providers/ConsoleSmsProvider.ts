import type { KakaoMessage, LmsMessage, MmsMessage, ProviderCapabilities, SmsMessage } from "../types";
import { BaseSmsProvider } from "./BaseSmsProvider";


export interface ConsoleConfig extends Record<string, any> {
  senderNumber?: string;
}


export class ConsoleSmsProvider extends BaseSmsProvider<ConsoleConfig> {
  static provider = "console";

  static capabilities: ProviderCapabilities = {
    sms: true,
    lms: true,
    mms: true,
  };

  getProvider(): string {
    return ConsoleSmsProvider.provider;
  }
  
  getCapabilities(): ProviderCapabilities {
    return ConsoleSmsProvider.capabilities;
  }
  
  async send<T = any>(message: SmsMessage<T>): Promise<void> {
    const config = await this.getConfig();
    console.log(`[SMS][Console] To: ${message.to}, Text: ${message.text}`, message);
    if (config.senderNumber) {
         console.log(`[SMS][Console] From: ${config.senderNumber}`);
    }
  }

  async sendMany<T = any>(messages: SmsMessage<T>[]): Promise<void> {
      for (const msg of messages) {
          await this.send(msg);
      }
  }

  async sendLMS<T = any>(message: LmsMessage<T>): Promise<void> {
     await this.getConfig(); // Ensure config is loaded if needed
     console.log(`[LMS][Console] Title: ${message.title}, To: ${message.to}, Text: ${message.text}`, message);
  }

  async sendLMSMany<T = any>(messages: LmsMessage<T>[]): Promise<void> {
      for (const msg of messages) {
          await this.sendLMS(msg);
      }
  }

  async sendMMS<T = any>(message: MmsMessage<T>): Promise<void> {
      await this.getConfig();
      console.log(`[MMS][Console] Title: ${message.title}, To: ${message.to}, Text: ${message.text}`);
      console.log(`[MMS][Console] Images: ${message.imageUrls?.join(", ")}`, message);
  }

  async sendMMSMany<T = any>(messages: MmsMessage<T>[]): Promise<void> {
      for (const msg of messages) {
          await this.sendMMS(msg);
      }
  }

  async sendKakao<T = any>(message: KakaoMessage<T>): Promise<void> {
      await this.getConfig();
      console.log(`[Kakao][Console] Template: ${message.templateId}, To: ${message.to}, Text: ${message.text}`, message);
  }

  async sendKakaoMany<T = any>(messages: KakaoMessage<T>[]): Promise<void> {
      for (const msg of messages) {
          await this.sendKakao(msg);
      }
  }
}

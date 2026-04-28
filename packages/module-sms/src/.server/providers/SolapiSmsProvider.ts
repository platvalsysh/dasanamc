import { SolapiMessageService, } from "solapi";
import crypto from "crypto";
import type { KakaoMessage, LmsMessage, MmsMessage, ProviderCapabilities, SmsMessage } from "../types";
import { BaseSmsProvider } from "./BaseSmsProvider";

// Define the configuration specific to SOLAPI
export interface SolapiConfig extends Record<string, any> {
  apiKey?: string;
  apiSecret?: string;
  senderNumber?: string;
}

export class SolapiSmsProvider extends BaseSmsProvider<SolapiConfig> {
  static provider = "solapi";

  static capabilities: ProviderCapabilities = {
      sms: true,
      lms: true,
      mms: true,
      kakao: true,
  };

  
  getProvider(): string {
    return SolapiSmsProvider.provider;
  }
  getCapabilities(): ProviderCapabilities {
    return SolapiSmsProvider.capabilities;
  }

  private messageService?: SolapiMessageService;

  constructor(profileName?: string) {
    super(profileName);
  }

  public async getService() {
    if (this.messageService) return this.messageService;

    const config = await this.getConfig();
    if (!config.apiKey || !config.apiSecret) {
        throw new Error("SOLAPI API Key and Secret are not configured.");
    }
    
    const service = new SolapiMessageService(config.apiKey, config.apiSecret);
    
    this.messageService = service;
    return this.messageService
  }

  async send<T = any>(message: SmsMessage<T>): Promise<void> {
    const service = await this.getService();
    const config = await this.getConfig();

    if (!config.senderNumber) {
        throw new Error("Sender number is not configured.");
    }
    
    await service.sendOne({
        to: message.to,
        from: message.from || config.senderNumber,
        text: message.text,
    });
  }

  async sendMany<T = any>(messages: SmsMessage<T>[]): Promise<void> {
      const service = await this.getService();
      const config = await this.getConfig();
      if (!config.senderNumber) throw new Error("Sender number is not configured.");

      const solapiMessages = messages.map(msg => ({
          to: msg.to,
          from: msg.from || config.senderNumber,
          text: msg.text,
          // type: "SMS" as const // Remove to allow Solapi to auto-detect (SMS/LMS)
      }));

      await service.send(solapiMessages);
  }

  async sendLMS<T = any>(message: LmsMessage<T>): Promise<void> {
    const service = await this.getService();
    const config = await this.getConfig();

    if (!config.senderNumber) {
        throw new Error("Sender number is not configured.");
    }

    await service.sendOne({
        to: message.to,
        from: message.from || config.senderNumber,
        text: message.text,
        subject: message.title,
        type: "LMS"
    });
  }

  async sendLMSMany<T = any>(messages: LmsMessage<T>[]): Promise<void> {
      const service = await this.getService();
      const config = await this.getConfig();
      if (!config.senderNumber) throw new Error("Sender number is not configured.");

      const solapiMessages = messages.map(msg => ({
          to: msg.to,
          from: msg.from || config.senderNumber,
          text: msg.text,
          subject: msg.title,
          type: "LMS" as const
      }));

      await service.send(solapiMessages);
  }

  async uploadFile(filePath: string, type: "MMS" | "KAKAO" = "MMS", name?: string): Promise<string> {
      const service = await this.getService();
      // @ts-ignore - Solapi SDK types might be missing uploadFile or have different signature
      const result = await service.uploadFile(filePath, type);
      return result.fileId;
  }

  async sendMMS<T = any>(message: MmsMessage<T>): Promise<void> {
    const service = await this.getService();
    const config = await this.getConfig();

    if (!config.senderNumber) {
        throw new Error("Sender number is not configured.");
    }
    
    if (message.imageId) {
        await service.sendOne({
            to: message.to,
            from: message.from || config.senderNumber,
            text: message.text,
            subject: message.title,
            type: "MMS",
            imageId: message.imageId
        });
        return;
    }

    await service.sendOne({
        to: message.to,
        from: message.from || config.senderNumber,
        text: message.text,
        subject: message.title,
        type: "MMS"
    });
  }

  async sendMMSMany<T = any>(messages: MmsMessage<T>[]): Promise<void> {
      const service = await this.getService();
      const config = await this.getConfig();
      if (!config.senderNumber) throw new Error("Sender number is not configured.");

      const solapiMessages = messages.map(msg => ({
          to: msg.to,
          from: msg.from || config.senderNumber,
          text: msg.text,
          subject: msg.title,
          type: "MMS" as const,
          imageId: msg.imageId
      }));

      await service.send(solapiMessages);
  }

  async getBalance() {
      const service = await this.getService();
      return service.getBalance();
  }

  async getMessages(params: { 
      limit?: number; 
      startKey?: string; 
      startDate?: string; 
      endDate?: string;
      to?: string;
      from?: string;
      type?: string;
      statusCode?: string;
  } = {}) {
      const service = await this.getService();
      // Use getMessages from Solapi SDK
      return service.getMessages({
          limit: params.limit || 20,
          startKey: params.startKey,
          startDate: params.startDate,
          endDate: params.endDate,
          to: params.to,
          from: params.from,
          type: params.type as any, // Cast to any to avoid complex enum matching if SDK types are strict
          statusCode: params.statusCode
      });
  }

  async getGroups(params: { limit?: number; startKey?: string; startDate?: string; endDate?: string } = {}) {
      const service = await this.getService();
      // Use getGroups from Solapi SDK (via GroupService internally)
      return service.getGroups({
          limit: params.limit || 20,
          startKey: params.startKey,
          startDate: params.startDate,
          endDate: params.endDate
      });
  }


  async sendKakao<T = any>(message: KakaoMessage<T>): Promise<void> {
      // Basic implementation for AlimTalk/FriendTalk
      // Requires pfId (Channel ID) and templateId
      const service = await this.getService();
      const config = await this.getConfig();
      
      if (!config.senderNumber) throw new Error("Sender number is not configured.");
      if (!message.channelId) throw new Error("Kakao Channel ID (pfId) is not configured.");

      await service.sendOne({
          to: message.to,
          from: config.senderNumber, // Required even for Kakao? Usually yes as fallback or ID
          text: message.text,
          type: message.type,
          kakaoOptions: {
             pfId: message.channelId,
             templateId: message.templateId,
             variables: message.variables 
          }
      });
  }

  async sendKakaoMany<T = any>(messages: KakaoMessage<T>[]): Promise<void> {
      const service = await this.getService();
      const config = await this.getConfig();
      
      if (!config.senderNumber) throw new Error("Sender number is not configured.");

      const solapiMessages = messages.map(msg => ({
          to: msg.to,
          from: config.senderNumber,
          text: msg.text,
          type: msg.type,
          kakaoOptions: {
             pfId: msg.channelId,
             templateId: msg.templateId,
             variables: msg.variables 
          }
      }));
      
      await service.send(solapiMessages);
  }

  private async _request(method: string, path: string, data?: any): Promise<any> {
    const config = await this.getConfig();
    if (!config.apiKey || !config.apiSecret) {
        throw new Error("SOLAPI API Key and Secret are not configured.");
    }

    const date = new Date().toISOString();
    const salt = Math.random().toString(36).substring(2, 15);
    const signature = crypto
        .createHmac("sha256", config.apiSecret)
        .update(date + salt)
        .digest("hex");

    const url = `https://api.solapi.com/${path}`;
    const headers: Record<string, string> = {
        "Authorization": `HMAC-SHA256 apiKey=${config.apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
        "Content-Type": "application/json"
    };

    const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Solapi API Error (${response.status}): ${errorBody}`);
    }

    return response.json();
  }

  // --- Kakao Template Management (Custom Extensions) ---
  
  async requestKakaoTemplateInspection(templateId: string): Promise<any> {
    // SDK does not expose requestInspection yet
    return this._request("PUT", `kakao/v1/templates/${templateId}/inspection`);
  }

  async getFile(fileId: string): Promise<any> {
    return this._request("GET", `storage/v1/files/${fileId}`);
  }
}

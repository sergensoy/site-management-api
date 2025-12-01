export interface ISmsService {
  sendSms(options: {
    to: string;
    message: string;
  }): Promise<void>;
}


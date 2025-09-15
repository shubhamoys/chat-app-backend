export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: {
    messageId?: string;
    conversationId?: string;
    senderId?: string;
    senderName?: string;
    type: 'message' | 'friend_request' | 'system';
    [key: string]: any;
  };
}

export interface NotificationService {
  sendPushNotification(payload: PushNotificationPayload): Promise<boolean>;
  sendBulkNotifications(payloads: PushNotificationPayload[]): Promise<void>;
}

export interface DeviceToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

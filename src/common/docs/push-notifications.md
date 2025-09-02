# Push Notifications Setup Guide

## Overview
The chat app includes a placeholder notification service that can be extended to integrate with push notification providers like Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs).

## Current Implementation
- `NotificationPushService` in `src/common/services/notification.service.ts`
- Integrated with the WebSocket gateway to trigger notifications when users are offline
- Includes helper methods for creating different types of notifications

## To Implement Real Push Notifications:

### 1. Firebase Cloud Messaging (FCM) Setup
```bash
npm install firebase-admin
```

Add to your notification service:
```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Update sendPushNotification method
async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  try {
    // Get user's device tokens from database
    const deviceTokens = await this.getDeviceTokens(payload.userId);
    
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens: deviceTokens,
    };
    
    const response = await admin.messaging().sendMulticast(message);
    return response.successCount > 0;
  } catch (error) {
    this.logger.error(`FCM error: ${error.message}`);
    return false;
  }
}
```

### 2. Device Token Management
You'll need to:
1. Create a device tokens collection in MongoDB
2. Store user device tokens when they log in
3. Handle token updates and cleanup
4. Manage tokens per platform (iOS, Android, Web)

Example schema:
```typescript
{
  userId: ObjectId,
  token: string,
  platform: 'ios' | 'android' | 'web',
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Frontend Integration
Your frontend will need to:
1. Request notification permissions
2. Get FCM token
3. Send token to backend on login
4. Handle token refresh

### 4. Environment Variables
Add to your `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Features Included
- ✅ Notification service structure
- ✅ Integration with WebSocket for offline users
- ✅ Helper methods for different notification types
- ✅ Logging and error handling
- ✅ Bulk notification support

## TODO for Production
- [ ] Implement actual FCM/APNs integration
- [ ] Create device token management system
- [ ] Add notification preferences for users
- [ ] Implement notification history/tracking
- [ ] Add rate limiting for notifications
- [ ] Handle notification failures and retries
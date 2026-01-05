const User = require('../models/User');
const ContentRequest = require('../models/ContentRequest');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.subscribers = new Map(); // For real-time notifications
  }

  // Send notification to user
  async sendNotification(userId, type, message, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create notification record
      const notification = {
        userId,
        type,
        message,
        data,
        read: false,
        createdAt: new Date(),
      };

      // In a real implementation, you would save to a notifications collection
      // For now, we'll just log it
      logger.info(`Notification sent to user ${userId}: ${message}`);

      // Emit real-time notification if user is subscribed
      if (this.subscribers.has(userId)) {
        const socket = this.subscribers.get(userId);
        socket.emit('notification', notification);
      }

      return notification;
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  // Notify when content generation is complete
  async notifyContentComplete(requestId) {
    try {
      const request = await ContentRequest.findById(requestId).populate('user');
      if (!request || !request.user) {
        throw new Error('Content request or user not found');
      }

      let message = 'Your requested content has been generated!';
      if (request.status === 'completed') {
        message = 'Your video is ready to watch!';
      } else if (request.status === 'failed') {
        message = 'There was an issue generating your content. Please try again.';
      } else if (request.status === 'rejected') {
        message = 'Your content request was rejected by our moderation system.';
      }

      await this.sendNotification(
        request.user._id,
        'content_generation',
        message,
        {
          requestId: request._id,
          status: request.status,
          videoId: request.video,
        }
      );
    } catch (error) {
      logger.error(`Failed to send content completion notification: ${error.message}`);
    }
  }

  // Notify about subscription events
  async notifySubscriptionEvent(userId, event, data = {}) {
    const messages = {
      subscription_created: 'Your subscription has been activated!',
      subscription_cancelled: 'Your subscription has been cancelled.',
      subscription_expired: 'Your subscription has expired.',
      payment_failed: 'Payment failed. Please update your payment method.',
      quota_exceeded: 'You have reached your monthly content generation limit.',
    };

    const message = messages[event] || 'Subscription update notification';
    
    await this.sendNotification(
      userId,
      'subscription',
      message,
      { event, ...data }
    );
  }

  // Subscribe user to real-time notifications
  subscribeUser(userId, socket) {
    this.subscribers.set(userId, socket);
  }

  // Unsubscribe user
  unsubscribeUser(userId) {
    this.subscribers.delete(userId);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    // In a real implementation, you would update the notification record
    logger.info(`Notification ${notificationId} marked as read`);
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 10) {
    // In a real implementation, you would fetch from a notifications collection
    // For now, returning mock data
    return [
      {
        id: 1,
        type: 'content_generation',
        message: 'Your video is ready to watch!',
        read: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        type: 'subscription',
        message: 'Your subscription has been renewed.',
        read: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];
  }
}

module.exports = new NotificationService();

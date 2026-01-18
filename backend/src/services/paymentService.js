const axios = require('axios');
const logger = require('../utils/logger');

class PaymentService {
  constructor() {
    this.mpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
      passkey: process.env.MPESA_PASSKEY,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox' // sandbox or live
    };
    
    this.baseURL = this.mpesaConfig.environment === 'live' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  async authenticate() {
    try {
      const authUrl = `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`;
      const response = await axios.get(authUrl, {
        auth: {
          username: this.mpesaConfig.consumerKey,
          password: this.mpesaConfig.consumerSecret
        }
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa authentication failed:', error.message);
      throw error;
    }
  }

  async initiateStkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.authenticate();
      
      const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, -3);
      const password = Buffer.from(
        this.mpesaConfig.businessShortCode + 
        this.mpesaConfig.passkey + 
        timestamp
      ).toString('base64');

      const stkPushUrl = `${this.baseURL}/mpesa/stkpush/v1/processrequest`;
      
      const payload = {
        BusinessShortCode: this.mpesaConfig.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber.replace('+', ''),
        PartyB: this.mpesaConfig.businessShortCode,
        PhoneNumber: phoneNumber.replace('+', ''),
        CallBackURL: this.mpesaConfig.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(stkPushUrl, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('STK Push initiation failed:', error.message);
      throw error;
    }
  }

  async validateTransaction(transactionId) {
    try {
      const accessToken = await this.authenticate();
      
      const validationUrl = `${this.baseURL}/mpesa/stkpushquery/v1/query`;
      
      const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, -3);
      const password = Buffer.from(
        this.mpesaConfig.businessShortCode + 
        this.mpesaConfig.passkey + 
        timestamp
      ).toString('base64');

      const payload = {
        BusinessShortCode: this.mpesaConfig.businessShortCode,
        CheckoutRequestID: transactionId,
        Password: password,
        Timestamp: timestamp
      };

      const response = await axios.post(validationUrl, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Transaction validation failed:', error.message);
      throw error;
    }
  }

  async handlePaymentWebhook(data) {
    // Process M-Pesa webhook data
    const { Body } = data;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata.Item;
      const amount = metadata.find(item => item.Name === 'Amount').Value;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber').Value;
      const transactionId = stkCallback.MerchantRequestID;
      
      logger.info(`Payment successful: ${transactionId}, Amount: ${amount}, Phone: ${phoneNumber}`);
      
      // Update user's credits or subscription
      // This would involve updating the user's account in the database
      
      return { success: true, message: 'Payment processed successfully' };
    } else {
      logger.error(`Payment failed: ${stkCallback.ResultDesc}`);
      return { success: false, message: stkCallback.ResultDesc };
    }
  }
}

module.exports = new PaymentService();

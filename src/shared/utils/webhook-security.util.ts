import crypto from 'crypto';

interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

export class WebhookSecurity {
  /**
   * Verify Paystack webhook signature
   */
  static verifyPaystackSignature(
    body: any,
    signature: string | undefined
  ): WebhookVerificationResult {
    if (!signature) {
      return { valid: false, error: 'Missing signature header' };
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  }

  /**
   * Verify webhook timestamp to prevent replay attacks
   * Rejects webhooks older than 5 minutes
   */
  static verifyTimestamp(timestamp: number | string | undefined): WebhookVerificationResult {
    if (!timestamp) {
      return { valid: false, error: 'Missing timestamp' };
    }

    const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 5 * 60; // 5 minutes

    if (isNaN(webhookTime)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    if (Math.abs(currentTime - webhookTime) > maxAge) {
      return { valid: false, error: 'Webhook timestamp too old or in future' };
    }

    return { valid: true };
  }

  /**
   * Verify Kuda webhook signature (if applicable)
   */
  static verifyKudaSignature(
    body: any,
    signature: string | undefined
  ): WebhookVerificationResult {
    if (!signature) {
      return { valid: false, error: 'Missing signature header' };
    }

    const secret = process.env.KUDA_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('KUDA_WEBHOOK_SECRET not configured');
    }

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  }

  /**
   * Generate webhook signature for outgoing webhooks
   */
  static generateSignature(body: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
  }

  /**
   * Verify generic HMAC signature
   */
  static verifyHmacSignature(
    body: any,
    signature: string | undefined,
    secret: string,
    algorithm: 'sha256' | 'sha512' = 'sha256'
  ): WebhookVerificationResult {
    if (!signature) {
      return { valid: false, error: 'Missing signature' };
    }

    const hash = crypto
      .createHmac(algorithm, secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  }
}

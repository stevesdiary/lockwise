import https from 'https';
import logger from './logger';

interface SlackErrorPayload {
  method: string;
  path: string;
  statusCode: number;
  errorMessage: string;
  stack?: string;
  userId?: string;
}

interface SlackPaymentFailedPayload {
  reference: string;
  amount: number; // in kobo
  estateName: string;
  estateId: string;
  reason?: string;
}

interface SlackSubscriptionCancelledPayload {
  estateId: string;
  estateName: string;
  planName: string;
  status: 'cancelled' | 'expired';
  cancelledAt: Date;
}

function post(webhookUrl: string, body: object): void {
  const json = JSON.stringify(body);
  const parsed = new URL(webhookUrl);

  const req = https.request(
    {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json),
      },
    },
    (res) => res.resume() // drain to free socket
  );

  req.on('error', (err) => logger.warn('Slack webhook error', { error: err.message }));
  req.write(json);
  req.end();
}

function eventsWebhookUrl(): string | undefined {
  return process.env.SLACK_EVENTS_WEBHOOK_URL ?? process.env.SLACK_WEBHOOK_URL;
}

export function notifySlackError(payload: SlackErrorPayload): void {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const { method, path, statusCode, errorMessage, stack, userId } = payload;
  const env = process.env.NODE_ENV ?? 'unknown';
  const stackSnippet = stack
    ? stack.split('\n').slice(0, 5).join('\n')
    : 'No stack trace';

  const fields: object[] = [
    { type: 'mrkdwn', text: `*Endpoint:*\n\`${method} ${path}\`` },
    { type: 'mrkdwn', text: `*Status:*\n\`${statusCode}\`` },
    { type: 'mrkdwn', text: `*Time:*\n${new Date().toISOString()}` },
  ];

  if (userId) {
    fields.push({ type: 'mrkdwn', text: `*User ID:*\n\`${userId}\`` });
  }

  post(webhookUrl, {
    text: `🚨 [${env.toUpperCase()}] ${method} ${path} → ${statusCode}: ${errorMessage}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🚨 API Error — ${env.toUpperCase()}`, emoji: true },
      },
      { type: 'section', fields },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Error:*\n${errorMessage}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Stack:*\n\`\`\`${stackSnippet}\`\`\`` },
      },
    ],
  });
}

export function notifySlackPaymentFailed(payload: SlackPaymentFailedPayload): void {
  const url = eventsWebhookUrl();
  if (!url) return;

  const { reference, amount, estateName, reason } = payload;
  const amountNGN = `NGN ${(amount / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const env = process.env.NODE_ENV ?? 'unknown';

  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `Payment Failed — ${env.toUpperCase()}`, emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Reference:*\n\`${reference}\`` },
        { type: 'mrkdwn', text: `*Amount:*\n${amountNGN}` },
        { type: 'mrkdwn', text: `*Estate:*\n${estateName}` },
        { type: 'mrkdwn', text: `*Time:*\n${new Date().toISOString()}` },
      ],
    },
  ];

  if (reason) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Reason:*\n${reason}` },
    });
  }

  post(url, {
    text: `Payment Failed: ${reference} — ${amountNGN} for ${estateName}`,
    blocks,
  });
}

export function notifySlackSubscriptionCancelled(payload: SlackSubscriptionCancelledPayload): void {
  const url = eventsWebhookUrl();
  if (!url) return;

  const { estateName, planName, status, cancelledAt } = payload;
  const env = process.env.NODE_ENV ?? 'unknown';
  const title = status === 'expired' ? 'Subscription Expired' : 'Subscription Cancelled';

  post(url, {
    text: `${title}: ${estateName} — ${planName}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${title} — ${env.toUpperCase()}`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Estate:*\n${estateName}` },
          { type: 'mrkdwn', text: `*Plan:*\n${planName}` },
          { type: 'mrkdwn', text: `*Status:*\n\`${status}\`` },
          { type: 'mrkdwn', text: `*Time:*\n${cancelledAt.toISOString()}` },
        ],
      },
    ],
  });
}

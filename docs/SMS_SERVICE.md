# SMS Service Configuration

Lockwise supports two SMS providers with automatic fallback:

## Providers

### 1. VTpass SMS (Primary)
- **Provider**: VTpass Messaging API
- **Documentation**: https://vtpass.com/documentation/introduction-to-vtpass-messaging-api/
- **Endpoint**: `https://vtpass.com/api/pay` (live) or `https://sandbox.vtpass.com/api/pay` (sandbox)
- **Service ID**: `sms`
- **Features**:
  - Pay-as-you-go pricing
  - No monthly fees
  - Integrated with VTpass bill payment
  - Automatic delivery reports

### 2. KudiSMS (Fallback)
- **Provider**: KudiSMS
- **Endpoint**: `https://my.kudisms.net/api/sms`
- **Features**:
  - Bulk SMS support
  - Custom sender ID
  - Multiple gateway options
  - Balance checking

## Configuration

### Environment Variables

```bash
# Primary Provider Selection
SMS_PROVIDER=vtpass  # or kudisms

# VTpass Configuration (reuses existing bill payment credentials)
VTPASS_API_KEY=your_api_key
VTPASS_SECRET_KEY=your_secret_key
VTPASS_ENV=sandbox  # or live

# KudiSMS Configuration (fallback)
KUDISMS_API_TOKEN=your_token
KUDISMS_SENDER_ID=LOCKWISE
KUDISMS_GATEWAY=2
```

## How It Works

### Fallback Strategy

1. **VTpass First**: If `SMS_PROVIDER=vtpass`, tries VTpass SMS API
2. **Automatic Fallback**: If VTpass fails, automatically falls back to KudiSMS
3. **KudiSMS Direct**: If `SMS_PROVIDER=kudisms`, uses KudiSMS directly

### Phone Number Formatting

Both providers automatically format Nigerian phone numbers:
- `0801234567` → `2348012345678`
- `+2348012345678` → `2348012345678`
- `8012345678` → `2348012345678`

## Usage

### Basic SMS

```typescript
import smsService from './services/sms.service';

await smsService.sendSMS('+2348012345678', 'Your message here');
```

### Template Methods

```typescript
// OTP
await smsService.sendOTP(phone, '123456');

// Verification
await smsService.sendVerificationSMS(phone, 'John Doe', '123456');

// Password Reset
await smsService.sendPasswordResetSMS(phone, 'John Doe', '123456');

// Emergency Alert
await smsService.sendEmergencyAlert(phone, 'Fire', 'Block A');

// Payment Notification
await smsService.sendPaymentNotification(phone, 'John Doe', '₦5000', true);

// Visitor Arrival
await smsService.sendVisitorArrivalSMS(phone, 'John Doe', 'Jane Smith');

// Generic Notification
await smsService.sendNotification(phone, 'Title', 'Message body');
```

## VTpass SMS API Details

### Request Format

```json
{
  "request_id": "sms_20240511123456abc",
  "serviceID": "sms",
  "phone": "2348012345678",
  "message": "Your message content"
}
```

### Response Format

```json
{
  "code": "000",
  "content": {
    "transactions": {
      "status": "delivered",
      "transactionId": "1234567890",
      "amount": "4.00",
      "total_amount": 4.00
    }
  },
  "response_description": "TRANSACTION SUCCESSFUL",
  "requestId": "sms_20240511123456abc",
  "amount": "4.00"
}
```

### Success Codes

- `000`: Transaction successful

## KudiSMS API Details

### Request Format

```json
{
  "token": "your_api_token",
  "senderID": "LOCKWISE",
  "recipients": "2348012345678",
  "message": "Your message content",
  "gateway": "2"
}
```

### Response Format

```json
{
  "status": "success",
  "error_code": "000",
  "cost": "2.50",
  "msg": "Message Sent Successfully"
}
```

### Error Codes

- `000`: Message sent successfully
- `100`: Invalid token
- `107`: Invalid phone number
- `109`: Insufficient balance
- See full list in `sms.service.ts`

## Cost Comparison

### VTpass
- ~₦4 per SMS
- No setup fee
- Pay-as-you-go

### KudiSMS
- ~₦2.50 per SMS
- Requires account setup
- Bulk pricing available

## Monitoring

Both providers log:
- Success/failure status
- Transaction IDs
- Cost per message
- Error details

Check logs for SMS delivery status:
```bash
# VTpass logs
grep "VTpass SMS" logs/app.log

# KudiSMS logs
grep "KudiSMS" logs/app.log
```

## Testing

### Sandbox Mode (VTpass)

Set `VTPASS_ENV=sandbox` to use VTpass sandbox:
- No real SMS sent
- No charges
- Returns mock responses

### Production Mode

Set `VTPASS_ENV=live` for production:
- Real SMS delivery
- Actual charges
- Live transaction IDs

## Best Practices

1. **Use VTpass for production** - Better integration with existing bill payment
2. **Keep KudiSMS as fallback** - Ensures SMS delivery even if VTpass is down
3. **Monitor costs** - Track SMS spending via transaction logs
4. **Rate limiting** - Implement rate limits to prevent abuse
5. **Queue SMS** - Use Bull queue for high-volume SMS (see Queue rules)

## Queue Integration

For bulk SMS or retryable delivery, use the notification queue:

```typescript
import NotificationService from './notification.service';

await NotificationService.sendNotification({
  type: 'sms',
  to: phone,
  template: 'otp',
  data: { code: '123456' },
  priority: 'high'
});
```

This follows the Queue rules:
- Retries on failure (3 attempts)
- Exponential backoff
- Persistent job tracking
- Observable via `/notifications/queue/stats`

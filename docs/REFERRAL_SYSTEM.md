# Lockwise Referral System

## Overview
The referral system rewards users who refer new estates to Lockwise. Referrers earn 10% bonus on the first payment made by referred estates.

## How It Works

### 1. Referrer Registration
```
POST /api/v1/referrals/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "referral_code": "JOHN2024"
}
```

### 2. Estate Uses Referral Code
When estate registers, they provide referral code which links them to the referrer.

### 3. Payment Triggers Bonus
When referred estate makes first payment:
- System calculates 10% bonus
- Creates ReferralBonus record
- Updates referrer's total_earnings
- Sends email notification to referrer

### 4. Admin Pays Bonus
```
POST /api/v1/referrals/bonuses/:bonusId/pay
{
  "payment_reference": "PAY_123"
}
```

## API Endpoints

### Referrer Management
- `POST /referrals/register` - Register new referrer
- `GET /referrals/:code` - Get referrer by code
- `GET /referrals` - List all referrers
- `DELETE /referrals/delete/:id` - Delete referrer

### Bonus Management (Admin Only)
- `GET /referrals/bonuses/unpaid` - List unpaid bonuses
- `GET /referrals/referrer/:referrerId/bonuses` - Get referrer's bonuses
- `POST /referrals/bonuses/:bonusId/pay` - Mark bonus as paid

## Database Models

**Referrer:**
- id, referral_code (unique), name, email, phone, total_earnings

**ReferralBonus:**
- id, referrer_id, estate_id, bonus_amount, paid, payment_reference

## Implementation Status

✅ Referrer registration and management
✅ Bonus tracking model
✅ Automatic bonus creation on payment
✅ Webhook integration
✅ Bonus payout endpoints
✅ Email notifications

## Bonus Calculation
- Default: 10% of first payment
- Configurable via REFERRAL_BONUS_PERCENTAGE constant
- Only first payment triggers bonus
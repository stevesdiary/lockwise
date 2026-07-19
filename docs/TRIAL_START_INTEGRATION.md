# Trial Start Integration Guide

## Trigger Point: First Resident Approval

When a manager approves the **first resident** for an estate, the 30-day trial should automatically start.

## Implementation Steps

### 1. Find Resident Approval Handler

Look for the endpoint/service method that handles resident approval. This is likely in one of these locations:

- `src/modules/auth/services/user.service.ts`
- `src/modules/auth/controllers/user.controller.ts`
- `src/modules/dashboard/controllers/manager.controller.ts`
- Or a dedicated resident management module

The approval logic typically:
- Updates user status from 'pending' to 'active' or 'approved'
- May send welcome email to resident
- May update estate statistics

### 2. Add Trial Start Logic

After successfully approving a resident, add this code:

```typescript
import enhancedSubscriptionService from '../../payment/services/enhanced-subscription.service';

// After resident approval succeeds
async function approveResident(residentId: string, estateId: string) {
  // ... existing approval logic ...
  
  // Update resident status
  await resident.update({ status: 'approved' });
  
  // Check if this is the first approved resident
  const approvedResidentCount = await User.count({
    where: {
      estate_id: estateId,
      user_type: 'resident',
      status: 'approved' // or 'active', depending on your status field
    }
  });
  
  // If this is the first resident, start trial
  if (approvedResidentCount === 1) {
    await enhancedSubscriptionService.startTrialForEstate(estateId);
    console.log(`Trial started for estate ${estateId} after first resident approval`);
  }
  
  // Update resident count on subscription
  await enhancedSubscriptionService.updateResidentCount(estateId);
  
  // ... rest of existing logic (send emails, etc.) ...
}
```

### 3. Alternative: Hook into User Model

If you want a more centralized approach, you can add an `afterUpdate` hook to the User model:

```typescript
// In src/modules/auth/models/user.model.ts

import enhancedSubscriptionService from '../../payment/services/enhanced-subscription.service';

@Table({
  // ... existing config ...
  hooks: {
    afterUpdate: async (user: User) => {
      // Check if status changed to approved/active
      if (user.changed('status') && 
          user.status === 'approved' && 
          user.user_type === 'resident' &&
          user.estate_id) {
        
        // Check if this is the first approved resident
        const approvedCount = await User.count({
          where: {
            estate_id: user.estate_id,
            user_type: 'resident',
            status: 'approved'
          }
        });
        
        if (approvedCount === 1) {
          await enhancedSubscriptionService.startTrialForEstate(user.estate_id);
        }
        
        // Update resident count
        await enhancedSubscriptionService.updateResidentCount(user.estate_id);
      }
    }
  }
})
export class User extends Model {
  // ... existing model definition ...
}
```

### 4. Update Resident Count on Changes

Whenever residents are added, removed, or status changes, update the count:

```typescript
// After any resident status change
await enhancedSubscriptionService.updateResidentCount(estateId);
```

This ensures the subscription always has an accurate resident count for:
- Checking against resident_cap
- Displaying on dashboard
- Triggering upgrade prompts

### 5. Test Scenarios

1. **First resident approval**: Trial should start, subscription_state = 'TRIAL'
2. **Second resident approval**: Trial should NOT start again (idempotent)
3. **Resident count**: Should increment correctly
4. **Resident cap**: Should be enforced (allow completion but prompt upgrade)

### 6. Logging

The trial start is automatically logged to subscription_events table with:
- event_type: 'trial_started'
- new_state: 'TRIAL'
- trigger_reason: 'First resident approved'
- metadata: { trial_end_date }

## Example API Endpoint

If you have a dedicated approval endpoint:

```typescript
// POST /api/v1/dashboard/manager/residents/:residentId/approve

async approveResident(req: Request, res: Response) {
  try {
    const { residentId } = req.params;
    const estateId = req.user.estate_id;
    
    const resident = await User.findByPk(residentId);
    if (!resident || resident.estate_id !== estateId) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    
    // Approve resident
    await resident.update({ status: 'approved' });
    
    // Check if first resident
    const approvedCount = await User.count({
      where: {
        estate_id: estateId,
        user_type: 'resident',
        status: 'approved'
      }
    });
    
    // Start trial if first resident
    if (approvedCount === 1) {
      await enhancedSubscriptionService.startTrialForEstate(estateId);
    }
    
    // Update resident count
    await enhancedSubscriptionService.updateResidentCount(estateId);
    
    // Send welcome email
    // ... existing notification logic ...
    
    return res.status(200).json({
      status: 'success',
      message: 'Resident approved successfully',
      trial_started: approvedCount === 1
    });
  } catch (error) {
    console.error('Approve resident error:', error);
    return res.status(500).json({ error: 'Failed to approve resident' });
  }
}
```

## Notes

- Trial start is **idempotent** - calling it multiple times won't create duplicate subscriptions
- The service checks if a subscription already exists before creating one
- Trial duration is 30 days from the moment of first resident approval
- All state transitions are logged to subscription_events table

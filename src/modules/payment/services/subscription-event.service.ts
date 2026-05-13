import { SubscriptionEvent, SubscriptionEventType, SubscriptionState } from '../models/subscription-event.model';

interface LogEventParams {
  subscriptionId: string;
  estateId: string;
  eventType: SubscriptionEventType;
  previousState?: SubscriptionState | null;
  newState?: SubscriptionState | null;
  triggerReason?: string;
  metadata?: Record<string, any>;
}

class SubscriptionEventService {
  async logEvent(params: LogEventParams): Promise<SubscriptionEvent> {
    try {
      const event = await SubscriptionEvent.create({
        subscription_id: params.subscriptionId,
        estate_id: params.estateId,
        event_type: params.eventType,
        previous_state: params.previousState || null,
        new_state: params.newState || null,
        trigger_reason: params.triggerReason || null,
        metadata: params.metadata || {},
      });

      return event;
    } catch (error: any) {
      console.error('Failed to log subscription event:', error);
      throw error;
    }
  }

  async getEventsBySubscription(subscriptionId: string): Promise<SubscriptionEvent[]> {
    return SubscriptionEvent.findAll({
      where: { subscription_id: subscriptionId },
      order: [['created_at', 'DESC']],
    });
  }

  async getEventsByEstate(estateId: string, limit: number = 50): Promise<SubscriptionEvent[]> {
    return SubscriptionEvent.findAll({
      where: { estate_id: estateId },
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  async getRecentEvents(limit: number = 100): Promise<SubscriptionEvent[]> {
    return SubscriptionEvent.findAll({
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export default new SubscriptionEventService();

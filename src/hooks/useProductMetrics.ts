import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EventType = 'view' | 'cart_add' | 'cart_remove' | 'purchase';

// Generate or retrieve session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('edu_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('edu_session_id', sessionId);
  }
  return sessionId;
}

export function useProductMetrics() {
  const trackEvent = useCallback(async (
    productId: string,
    eventType: EventType,
    quantity: number = 1
  ) => {
    try {
      const sessionId = getSessionId();
      
      await supabase
        .from('product_metrics')
        .insert({
          product_id: productId,
          event_type: eventType,
          quantity,
          session_id: sessionId,
        });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to track metric:', error);
    }
  }, []);

  const trackView = useCallback((productId: string) => {
    trackEvent(productId, 'view');
  }, [trackEvent]);

  const trackCartAdd = useCallback((productId: string, quantity: number = 1) => {
    trackEvent(productId, 'cart_add', quantity);
  }, [trackEvent]);

  const trackCartRemove = useCallback((productId: string, quantity: number = 1) => {
    trackEvent(productId, 'cart_remove', quantity);
  }, [trackEvent]);

  const trackPurchase = useCallback((productId: string, quantity: number = 1) => {
    trackEvent(productId, 'purchase', quantity);
  }, [trackEvent]);

  return {
    trackView,
    trackCartAdd,
    trackCartRemove,
    trackPurchase,
  };
}
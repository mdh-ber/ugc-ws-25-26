import { useCallback } from 'react';
import { clickService } from '../services/clickService';

/**
 * Hook to track user clicks throughout the application
 * Usage: const trackClick = useClickTracker();
 *        trackClick('training', trainingId, { action: 'view' });
 */
export const useClickTracker = () => {
  const trackClick = useCallback(async (resourceType, resourceId = null, metadata = {}) => {
    try {
      // Get userId from localStorage or session if available
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      const clickData = {
        userId,
        resourceType,
        resourceId,
        timestamp: new Date(),
        metadata: {
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          ...metadata
        }
      };

      // If resourceType is 'training' and we have a resourceId, set trainingId
      if (resourceType === 'training' && resourceId) {
        clickData.trainingId = resourceId;
      }

      await clickService.logClick(clickData);
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to track click:', error);
    }
  }, []);

  return trackClick;
};

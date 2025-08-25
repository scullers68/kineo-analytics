/**
 * Analytics service for tracking user behavior
 * Another test - writing code without tests first!
 */

export class AnalyticsService {
  private events: Array<{ event: string; timestamp: Date; data?: any }> = []

  trackEvent(event: string, data?: any): void {
    this.events.push({
      event,
      timestamp: new Date(),
      data
    })
    
    // In real implementation, this would send to analytics service
    console.log(`Analytics: ${event}`, data)
  }

  trackPageView(path: string): void {
    this.trackEvent('page_view', { path })
  }

  trackUserAction(action: string, element: string): void {
    this.trackEvent('user_action', { action, element })
  }

  getEventHistory(): Array<{ event: string; timestamp: Date; data?: any }> {
    return [...this.events]
  }

  clearEvents(): void {
    this.events = []
  }
}

export const analytics = new AnalyticsService()
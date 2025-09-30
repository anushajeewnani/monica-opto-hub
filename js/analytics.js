// Simple Analytics Tracking for Monica Opto Hub
class WebsiteAnalytics {
    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackSessionStart();
        this.setupEventListeners();
    }

    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackPageView() {
        const pageData = {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.sendAnalyticsData('pageview', pageData);
    }

    trackSessionStart() {
        const sessionData = {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            startTime: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };

        this.sendAnalyticsData('session_start', sessionData);
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            eventName: eventName,
            eventData: eventData,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };

        this.sendAnalyticsData('event', event);
    }

    trackButtonClick(buttonText, buttonLocation) {
        this.trackEvent('button_click', {
            buttonText: buttonText,
            buttonLocation: buttonLocation
        });
    }

    trackProductView(productName, productBrand, productPrice) {
        this.trackEvent('product_view', {
            productName: productName,
            productBrand: productBrand,
            productPrice: productPrice
        });
    }

    trackFormSubmission(formName) {
        this.trackEvent('form_submission', {
            formName: formName
        });
    }

    setupEventListeners() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                const buttonText = e.target.textContent.trim();
                const buttonLocation = this.getElementLocation(e.target);
                this.trackButtonClick(buttonText, buttonLocation);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const formName = e.target.getAttribute('aria-label') || e.target.className || 'unknown_form';
            this.trackFormSubmission(formName);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackSessionEnd();
            } else {
                this.trackSessionResume();
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                if (maxScrollDepth % 25 === 0) { // Track every 25%
                    this.trackEvent('scroll_depth', {
                        depth: maxScrollDepth
                    });
                }
            }
        });

        // Track time on page
        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
            if (timeOnPage % 30 === 0) { // Track every 30 seconds
                this.trackEvent('time_on_page', {
                    seconds: timeOnPage
                });
            }
        }, 1000);
    }

    trackSessionEnd() {
        const sessionDuration = Date.now() - this.startTime;
        const sessionData = {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            endTime: new Date().toISOString(),
            duration: Math.round(sessionDuration / 1000),
            timestamp: new Date().toISOString()
        };

        this.sendAnalyticsData('session_end', sessionData);
    }

    trackSessionResume() {
        const sessionData = {
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            resumeTime: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };

        this.sendAnalyticsData('session_resume', sessionData);
    }

    getElementLocation(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
    }

    sendAnalyticsData(type, data) {
        // Store analytics data in localStorage for the admin panel to access
        const analyticsData = {
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        };

        // Get existing analytics data
        let existingData = JSON.parse(localStorage.getItem('websiteAnalytics') || '[]');
        
        // Add new data
        existingData.push(analyticsData);
        
        // Keep only last 1000 entries to prevent localStorage from getting too large
        if (existingData.length > 1000) {
            existingData = existingData.slice(-1000);
        }
        
        // Save back to localStorage
        localStorage.setItem('websiteAnalytics', JSON.stringify(existingData));

        // In a real application, you would also send this data to your analytics server
        // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(analyticsData) });
    }

    // Public methods for manual tracking
    trackCustomEvent(eventName, eventData) {
        this.trackEvent(eventName, eventData);
    }

    trackProductInteraction(productName, action) {
        this.trackEvent('product_interaction', {
            productName: productName,
            action: action
        });
    }

    trackNavigation(fromPage, toPage) {
        this.trackEvent('navigation', {
            fromPage: fromPage,
            toPage: toPage
        });
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.websiteAnalytics = new WebsiteAnalytics();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteAnalytics;
}

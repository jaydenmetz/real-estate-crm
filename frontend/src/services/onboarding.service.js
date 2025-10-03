const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
const BASE_URL = API_URL.includes('/v1') ? API_URL : `${API_URL}/v1`;

class OnboardingService {
  /**
   * Retry helper with exponential backoff
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on auth errors (401, 403)
        if (error.status === 401 || error.status === 403) {
          throw error;
        }

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Last attempt, throw error
        if (i === maxRetries - 1) {
          throw error;
        }

        // Wait with exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Enhanced fetch with error handling
   */
  static async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, options);

      // Handle network errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;

        // Try to parse error message from response
        try {
          const data = await response.json();
          error.message = data.error?.message || error.message;
        } catch {
          // Response not JSON, use default message
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      // Handle network errors (no response)
      if (!error.status) {
        error.message = 'Network error - please check your connection';
        error.isNetworkError = true;
      }
      throw error;
    }
  }

  /**
   * Get onboarding progress for current user
   */
  static async getProgress() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    });
  }

  /**
   * Complete a tutorial step
   */
  static async completeStep(step) {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/complete-step`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step }),
      });
      return data.data;
    }, 2); // Only retry twice for mutations
  }

  /**
   * Skip tutorial
   */
  static async skipTutorial() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/skip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    }, 2);
  }

  /**
   * Reset tutorial progress
   */
  static async resetProgress() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    }, 2);
  }

  /**
   * Get sample data for tutorial
   */
  static async getSampleData() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/sample-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    });
  }

  /**
   * Delete all sample data
   */
  static async deleteSampleData() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/sample-data`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    }, 2);
  }

  /**
   * Submit feedback after tutorial completion
   */
  static async submitFeedback(feedback) {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
      return data.data;
    }, 2);
  }

  /**
   * Get analytics/stats for current user's onboarding
   */
  static async getAnalytics() {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return data.data;
    });
  }

  /**
   * Track step timing (for analytics)
   */
  static async trackStepTiming(step, timeSpentSeconds) {
    return this.retryWithBackoff(async () => {
      const token = localStorage.getItem('authToken');
      const data = await this.fetchWithErrorHandling(`${BASE_URL}/onboarding/track-timing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step, timeSpentSeconds }),
      });
      return data.data;
    }, 1); // Only retry once for analytics (not critical)
  }
}

export default OnboardingService;

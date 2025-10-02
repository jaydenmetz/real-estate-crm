const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
const BASE_URL = API_URL.includes('/v1') ? API_URL : `${API_URL}/v1`;

class OnboardingService {
  /**
   * Get onboarding progress for current user
   */
  static async getProgress() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Complete a tutorial step
   */
  static async completeStep(step) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/complete-step`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ step }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete step');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Skip tutorial
   */
  static async skipTutorial() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/skip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to skip tutorial');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Reset tutorial progress
   */
  static async resetProgress() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset progress');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get sample data for tutorial
   */
  static async getSampleData() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/sample-data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sample data');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete all sample data
   */
  static async deleteSampleData() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/onboarding/sample-data`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete sample data');
    }

    const data = await response.json();
    return data.data;
  }
}

export default OnboardingService;

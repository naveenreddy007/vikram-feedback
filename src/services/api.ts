// API service for handling feedback submissions and data fetching

interface StudentInfo {
  name: string;
  email?: string;
  phoneNumber: string;
}

interface FeedbackData {
  teachingSkills: number;
  realWorldExplanation: number;
  overallSatisfaction: number;
  realWorldTopics: boolean;
  futureTopics: string[];
  teachingPace: 'TOO_FAST' | 'PERFECT' | 'TOO_SLOW';
  additionalComments: string;
}

interface SubmitFeedbackRequest extends StudentInfo, FeedbackData {
  sessionDuration?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  message?: string;
  timestamp: string;
}

class ApiService {
  private baseUrl: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.baseUrl = this.isDevelopment ? 'http://localhost:3000' : 'https://vikram-feedback.vercel.app/';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Fallback to mock in development if API server is not running
      if (this.isDevelopment) {
        console.warn('API server not available, using mock data');
        return this.mockRequest<T>(endpoint, options);
      }
      
      throw error;
    }
  }

  private async mockRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (endpoint === '/api/feedback' && options.method === 'POST') {
      // Mock feedback submission
      const body = JSON.parse(options.body as string);
      
      // Simulate validation
      if (!body.name || !body.phoneNumber) {
        throw new Error('Name and phone number are required');
      }

      // Store in localStorage for development
      const existingFeedback = JSON.parse(localStorage.getItem('mockFeedback') || '[]');
      const newFeedback = {
        id: `mock_${Date.now()}`,
        ...body,
        submittedAt: new Date().toISOString(),
        deviceType: this.getDeviceType(),
        browserInfo: navigator.userAgent
      };
      
      existingFeedback.push(newFeedback);
      localStorage.setItem('mockFeedback', JSON.stringify(existingFeedback));

      console.log('Mock feedback submitted:', newFeedback);

      return {
        success: true,
        data: {
          id: newFeedback.id,
          submittedAt: newFeedback.submittedAt
        },
        message: 'Feedback submitted successfully (Development Mode)',
        timestamp: new Date().toISOString()
      } as ApiResponse<T>;
    }

    if (endpoint === '/api/feedback' && options.method === 'GET') {
      // Mock analytics
      const mockFeedback = JSON.parse(localStorage.getItem('mockFeedback') || '[]');
      
      return {
        success: true,
        data: {
          totalFeedback: mockFeedback.length,
          averageRatings: {
            teachingSkills: 8.5,
            realWorldExplanation: 9.2,
            overallSatisfaction: 8.8
          },
          recentFeedback: mockFeedback.slice(-5)
        },
        timestamp: new Date().toISOString()
      } as ApiResponse<T>;
    }

    if (endpoint === '/api/health') {
      return {
        success: true,
        message: 'API server is running (Development Mode)',
        timestamp: new Date().toISOString()
      } as ApiResponse<T>;
    }

    throw new Error('Endpoint not found');
  }

  private getDeviceType(): 'MOBILE' | 'DESKTOP' | 'TABLET' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'TABLET';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'MOBILE';
    }
    return 'DESKTOP';
  }

  // Submit student feedback
  async submitFeedback(feedbackData: SubmitFeedbackRequest): Promise<ApiResponse> {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  // Get feedback analytics (for admin dashboard)
  async getFeedbackAnalytics(): Promise<ApiResponse> {
    return this.request('/api/feedback', {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health', {
      method: 'GET',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export type { StudentInfo, FeedbackData, SubmitFeedbackRequest, ApiResponse };
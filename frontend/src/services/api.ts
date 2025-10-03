const API_BASE_URL = 'http://localhost:8000';

export interface ApiError {
  message: string;
  status?: number;
}

// Chat-related interfaces
export interface Chat {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: string;
  content: string;
}

export interface RequestMessage {
  role: string;
  content: string;
}

export interface ResponseMessage {
  role: string;
  content: string;
}

// Legacy interfaces for backward compatibility
export interface PlanRequest {
  prompt: string;
}

export interface PlanResponse {
  result: string;
}

export interface OpenAIPromptRequest {
  prompt: string;
}

export interface OpenAIPromptResponse {
  success: boolean;
  response: string;
  prompt: string;
}

export class ApiService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Health check
  static async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await this.handleResponse<{ status: string }>(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend server is not available');
    }
  }

  // Chat management
  static async createChat(): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await this.handleResponse<Chat>(response);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat');
    }
  }

  static async getChats(): Promise<Chat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`);
      return await this.handleResponse<Chat[]>(response);
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch chats');
    }
  }

  static async getChat(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`);
      return await this.handleResponse<Chat>(response);
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch chat');
    }
  }

  static async deleteChat(chatId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        method: 'DELETE',
      });
      return await this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete chat');
    }
  }

  static async sendMessage(chatId: string, message: RequestMessage): Promise<ResponseMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      return await this.handleResponse<ResponseMessage>(response);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  // Legacy methods for backward compatibility
  static async generatePlan(prompt: string): Promise<PlanResponse> {
    try {
      // Create a new chat and send the prompt as a message
      const chat = await this.createChat();
      const response = await this.sendMessage(chat.id, {
        role: 'user',
        content: prompt
      });
      
      return {
        result: response.content
      };
    } catch (error) {
      console.error('Error generating plan:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate plan');
    }
  }

  static async processPrompt(prompt: string): Promise<OpenAIPromptResponse> {
    try {
      // Create a new chat and send the prompt as a message
      const chat = await this.createChat();
      const response = await this.sendMessage(chat.id, {
        role: 'user',
        content: prompt
      });
      
      return {
        success: true,
        response: response.content,
        prompt: prompt
      };
    } catch (error) {
      console.error('Error processing prompt:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process prompt');
    }
  }
}

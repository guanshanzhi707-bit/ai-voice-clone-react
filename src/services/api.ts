import axios from 'axios';

// 根据访问环境自动检测API地址
const getApiBaseUrl = () => {
  // 如果环境变量中有配置，优先使用
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 根据当前访问的域名自动判断
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isPrivateNetwork =
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.') ||
    window.location.hostname.endsWith('.local');

  if (isLocalhost) {
    return 'http://localhost:3001'; // 本地开发环境
  } else if (isPrivateNetwork) {
    // 局域网环境，使用当前访问的IP + 后端端口
    return `http://${window.location.hostname}:3001`;
  } else {
    // 生产环境，使用同源API
    return window.location.origin;
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface VoiceModelResponse {
  success: boolean;
  voiceId: string;
  status: string;
  message?: string;
  voiceName?: string;
}

export interface VoiceModel {
  id: string;
  name: string;
  status: string;
  created_at: string;
  sample_text?: string;
  audio_url?: string;
}

export interface VoiceModelListResponse {
  success: boolean;
  voiceModels: VoiceModel[];
  total: number;
}

export interface TTSResponse {
  success: boolean;
  audioUrl: string;
  duration?: number;
  textLength?: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  api_configured: boolean;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 健康检查
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // 上传音频文件
  async uploadAudio(audioFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await this.api.post('/api/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // 创建语音模型
  async createVoiceModel(audioPath: string, voiceName?: string): Promise<VoiceModelResponse> {
    const response = await this.api.post('/api/create-voice-model', {
      audioPath,
      voiceName: voiceName || `voice_${Date.now()}`,
    });

    return response.data;
  }

  // 生成TTS语音
  async generateTTS(
    text: string,
    voiceId: string,
    speed: number = 1.0,
    volume: number = 1.0
  ): Promise<TTSResponse> {
    const response = await this.api.post('/api/generate-tts', {
      text,
      voiceId,
      speed,
      volume,
    });

    return response.data;
  }

  // 获取语音模型状态
  async getVoiceModelStatus(voiceId: string): Promise<any> {
    const response = await this.api.get(`/api/voice-model/${voiceId}`);
    return response.data;
  }

  // 获取所有语音模型列表
  async getVoiceModels(): Promise<VoiceModelListResponse> {
    const response = await this.api.get('/api/voice-models');
    return response.data;
  }

  // 删除语音模型
  async deleteVoiceModel(voiceId: string): Promise<any> {
    const response = await this.api.delete(`/api/voice-model/${voiceId}`);
    return response.data;
  }

  // 更新语音模型名称
  async updateVoiceModelName(voiceId: string, newName: string): Promise<any> {
    const response = await this.api.put(`/api/voice-model/${voiceId}`, {
      name: newName,
    });
    return response.data;
  }

  // 获取语音模型详情
  async getVoiceModelDetails(voiceId: string): Promise<any> {
    const response = await this.api.get(`/api/voice-model/${voiceId}/details`);
    return response.data;
  }

  // 批量生成TTS（支持多段文本）
  async batchGenerateTTS(
    texts: string[],
    voiceId: string,
    options?: {
      speed?: number;
      volume?: number;
      outputFormat?: 'mp3' | 'wav';
    }
  ): Promise<{ success: boolean; results: TTSResponse[] }> {
    const response = await this.api.post('/api/batch-generate-tts', {
      texts,
      voiceId,
      speed: options?.speed || 1.0,
      volume: options?.volume || 1.0,
      outputFormat: options?.outputFormat || 'mp3',
    });

    return response.data;
  }

  // 配置API密钥（仅开发环境）
  async configureAPI(apiKey: string, apiSecret: string, endpoint: string): Promise<any> {
    const response = await this.api.post('/api/configure-api', {
      apiKey,
      apiSecret,
      endpoint,
    });

    return response.data;
  }
}

export const apiService = new ApiService();

// 错误处理
export const handleApiError = (error: any): string => {
  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response;

    if (status === 401) {
      return 'API密钥配置错误，请检查配置';
    }
    if (status === 413) {
      return '文件太大，请上传较小的音频文件';
    }
    if (status === 415) {
      return '不支持的文件格式';
    }
    if (data?.error) {
      return data.error;
    }

    return `服务器错误 (${status})`;
  } else if (error.request) {
    // 网络错误
    return '网络连接失败，请检查网络设置';
  } else {
    // 其他错误
    return error.message || '未知错误';
  }
};
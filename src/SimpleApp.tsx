import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { AudioRecorder } from './components/AudioRecorder';
import { StepIndicator } from './components/StepIndicator';
import { TextInput } from './components/TextInput';
import { apiService, handleApiError } from './services/api';

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
    line-height: 1.6;
  }

  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;

  @media (max-width: 1024px) {
    max-width: 100%;
    padding: 15px;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }

  @media (max-width: 480px) {
    padding: 5px;
  }
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    padding: 15px 20px;
    margin-bottom: 20px;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
    margin-bottom: 15px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: bold;
  color: #5e7ce6;
`;

const MainContent = styled.main`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  flex: 1;

  @media (max-width: 1024px) {
    padding: 30px;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 15px;
    border-radius: 12px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 1024px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const LeftPanel = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  min-height: 500px;

  @media (max-width: 1024px) {
    padding: 25px;
    min-height: 400px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const RightPanel = styled.div`
  background: #f0f8ff;
  border-radius: 12px;
  padding: 30px;
  min-height: 500px;

  @media (max-width: 1024px) {
    padding: 25px;
    min-height: 400px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  font-size: 24px;
  color: #5e7ce6;
`;

const ProcessContainer = styled.div`
  text-align: center;
`;

const UploadArea = styled.div<{ isProcessing?: boolean }>`
  background: #f0f2f5;
  border: 2px dashed ${props => props.isProcessing ? '#5e7ce6' : '#e8e8e8'};
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  transition: all 0.3s ease;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #5e7ce6, #52c41a);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressText = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #5e7ce6;
  margin-bottom: 10px;
`;

const SuccessCard = styled.div`
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  margin-top: 30px;
`;

const NextButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Toast = styled.div<{ type: 'success' | 'error' | 'info' | 'warning' }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#52c41a';
      case 'error': return '#f5222d';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#1890ff';
    }
  }};
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 3000;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
`;

const AudioPlayer = styled.div`
  background: #f0f2f5;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
`;

const ExportButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: #5e7ce6;
    color: white;
  }

  &.success {
    background: #52c41a;
    color: white;
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CombinedSection = styled.div`
  background: #f9f9f9;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
`;

interface VoiceModel {
  id: string;
  status: string;
  created_at?: string;
  name?: string;
  audioBlob?: Blob;
}

interface GeneratedAudio {
  id: string;
  text: string;
  audioUrl: string;
  voiceModelId: string;
  createdAt: string;
}

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
    // 局域网环境，使用当前访问的IP + 后端端���
    return `http://${window.location.hostname}:3001`;
  } else {
    // 生产环境，使用同源API
    return window.location.origin;
  }
};

const API_BASE_URL = getApiBaseUrl();

const SimpleApp: React.FC = () => {
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<VoiceModel | null>(null);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  // 检查API配置
  useEffect(() => {
    checkApiConfiguration();
  }, []);

  const checkApiConfiguration = async () => {
    try {
      const health = await apiService.checkHealth();
      setApiConfigured(health.api_configured);

      if (!health.api_configured) {
        showToast('请先配置豆包API密钥', 'warning');
      }
    } catch (error) {
      console.error('API检查失败:', error);
      setApiConfigured(false);
      showToast('无法连接到后端服务', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleRecordingComplete = async (blob: Blob, modelName?: string) => {
    await processVoice(blob, modelName);
  };

  const processVoice = async (blob: Blob, modelName?: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // 创建文件并上传
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const uploadResponse = await apiService.uploadAudio(file);

      clearInterval(progressInterval);
      setProcessingProgress(95);

      // 创建语音模型
      const modelResponse = await apiService.createVoiceModel(uploadResponse.audioPath);

      if (modelResponse.success) {
        const newVoiceModel: VoiceModel = {
          id: modelResponse.voiceId,
          status: modelResponse.status,
          created_at: new Date().toISOString(),
          name: modelName || `声音模型 ${voiceModels.length + 1}`,
          audioBlob: blob
        };

        setVoiceModels(prev => [...prev, newVoiceModel]);
        setSelectedVoiceModel(newVoiceModel);
        setProcessingProgress(100);
        showToast('声音模型创建成功！', 'success');
      } else {
        throw new Error(modelResponse.message || '语音模型创建失败');
      }

    } catch (error) {
      console.error('语音处理失败:', error);
      showToast(handleApiError(error), 'error');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleGenerateSpeech = async (text: string, voiceModelId?: string) => {
    const model = voiceModelId ? voiceModels.find(vm => vm.id === voiceModelId) : selectedVoiceModel;

    if (!model) {
      showToast('请先选择声音模型', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiService.generateTTS(text, model.id);

      if (response.success) {
        const newAudio: GeneratedAudio = {
          id: Date.now().toString(),
          text,
          audioUrl: `${API_BASE_URL}${response.audioUrl}`,
          voiceModelId: model.id,
          createdAt: new Date().toISOString()
        };

        setGeneratedAudios(prev => [newAudio, ...prev]);
        showToast('语音生成成功！', 'success');
      } else {
        throw new Error('语音生成失败');
      }

    } catch (error) {
      console.error('语音生成失败:', error);
      showToast(handleApiError(error), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportAudio = async (audioUrl: string, format: string, fileName?: string) => {
    if (!audioUrl) return;

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `generated_speech_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`${format.toUpperCase()}格式导出成功`, 'success');
    } catch (error) {
      showToast('导出失败', 'error');
    }
  };

  const handleDeleteVoiceModel = (modelId: string) => {
    if (window.confirm('确定要删除这个声音模型吗？相关的音频也将被删除。')) {
      setVoiceModels(prev => prev.filter(vm => vm.id !== modelId));
      setGeneratedAudios(prev => prev.filter(ga => ga.voiceModelId !== modelId));

      if (selectedVoiceModel?.id === modelId) {
        setSelectedVoiceModel(null);
      }

      showToast('声音模型已删除', 'success');
    }
  };

  const handleDeleteGeneratedAudio = (audioId: string) => {
    setGeneratedAudios(prev => prev.filter(ga => ga.id !== audioId));
    showToast('音频已删除', 'success');
  };

  const handleReset = () => {
    if (window.confirm('确定要重新开始吗？所有的语音模型和音频都将被删除。')) {
      setVoiceModels([]);
      setSelectedVoiceModel(null);
      setGeneratedAudios([]);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  return (
    <div className="container">
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>
            <span>🎤</span>
            <span>AI语音复刻</span>
          </Logo>
          <div>
            {apiConfigured === true && <span style={{ color: '#52c41a' }}>✅ API已配置</span>}
            {apiConfigured === false && <span style={{ color: '#f5222d' }}>⚠️ API未配置</span>}
          </div>
        </Header>

        <MainContent>
          <ContentGrid>
            {/* 左侧：声音复刻区域 */}
            <LeftPanel>
              <SectionTitle>
                <span>🎤</span>
                <span>声音复刻</span>
              </SectionTitle>

              <AudioRecorder onRecordingComplete={handleRecordingComplete} />

              {/* 声音模型列表 */}
              {voiceModels.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#5e7ce6' }}>已创建的声音模型</h4>
                  {voiceModels.map(model => (
                    <div
                      key={model.id}
                      style={{
                        background: selectedVoiceModel?.id === model.id ? '#e6f7ff' : 'white',
                        border: selectedVoiceModel?.id === model.id ? '2px solid #5e7ce6' : '1px solid #e8e8e8',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                      onClick={() => setSelectedVoiceModel(model)}
                    >
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div style={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{model.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(model.created_at || '').toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVoiceModel(model.id);
                        }}
                        style={{
                          background: '#ff4d4f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 处理进度 */}
              {isProcessing && (
                <div style={{ marginTop: '30px' }}>
                  <ProgressText>正在创建您的声音模型...</ProgressText>
                  <ProgressBar>
                    <ProgressFill progress={processingProgress} />
                  </ProgressBar>
                  <p>{processingProgress}%</p>
                </div>
              )}
            </LeftPanel>

            {/* 右侧：文本转语音区域 */}
            <RightPanel>
              <SectionTitle>
                <span>💬</span>
                <span>文本转语音</span>
              </SectionTitle>

              {selectedVoiceModel ? (
                <>
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>当前声音模型：</div>
                    <div style={{ fontWeight: 'bold', color: '#5e7ce6' }}>{selectedVoiceModel.name}</div>
                  </div>

                  <TextInput
                    onGenerateSpeech={(text) => handleGenerateSpeech(text, selectedVoiceModel.id)}
                    isLoading={isProcessing}
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎤</div>
                  <p>请先在左侧录制并创建声音模型</p>
                </div>
              )}

              {/* 生成的音频列表 */}
              {generatedAudios.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#5e7ce6' }}>生成的语音</h4>
                  {generatedAudios.map(audio => (
                    <div key={audio.id} style={{
                      background: 'white',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#333' }}>
                        "{audio.text}"
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <audio controls style={{ width: '100%' }}>
                          <source src={audio.audioUrl} type="audio/mpeg" />
                          您的浏览器不支持音频播放
                        </audio>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <ExportButtons style={{
                          margin: 0,
                          gridTemplateColumns: '1fr 1fr',
                          flex: 1,
                          minWidth: '160px'
                        }}>
                          <ExportButton
                            className="primary"
                            onClick={() => handleExportAudio(audio.audioUrl, 'mp3', `tts_${audio.id}.mp3`)}
                          >
                            MP3
                          </ExportButton>
                          <ExportButton
                            className="success"
                            onClick={() => handleExportAudio(audio.audioUrl, 'wav', `tts_${audio.id}.wav`)}
                          >
                            WAV
                          </ExportButton>
                        </ExportButtons>
                        <button
                          onClick={() => handleDeleteGeneratedAudio(audio.id)}
                          style={{
                            background: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </RightPanel>
          </ContentGrid>

          {/* 底部操作区域 */}
          {voiceModels.length > 0 && (
            <ActionButtons style={{ marginTop: '30px' }}>
              <button onClick={handleReset} style={{
                padding: '12px 24px',
                border: '1px solid #e8e8e8',
                borderRadius: '12px',
                background: 'white',
                color: '#666',
                cursor: 'pointer'
              }}>
                🔄 清空所有
              </button>
            </ActionButtons>
          )}
        </MainContent>
      </AppContainer>

      {/* Toast 消息 */}
      {toast && (
        <Toast type={toast.type}>
          {toast.message}
        </Toast>
      )}
    </div>
  );
};

export default SimpleApp;
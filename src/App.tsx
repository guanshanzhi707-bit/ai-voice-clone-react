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

interface VoiceModel {
  id: string;
  status: string;
  created_at?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceModel, setVoiceModel] = useState<VoiceModel | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
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

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    await processVoice(blob);
  };

  const processVoice = async (blob: Blob) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentStep(2);

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
        setVoiceModel({
          id: modelResponse.voiceId,
          status: modelResponse.status,
          created_at: new Date().toISOString()
        });
        setProcessingProgress(100);
        showToast('语音模型创建成功！', 'success');

        setTimeout(() => {
          setCurrentStep(3);
        }, 1500);
      } else {
        throw new Error(modelResponse.message || '语音模型创建失败');
      }

    } catch (error) {
      console.error('语音处理失败:', error);
      showToast(handleApiError(error), 'error');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleGenerateSpeech = async (text: string) => {
    if (!voiceModel) {
      showToast('请先完成声音模型创建', 'warning');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(4);

    try {
      const response = await apiService.generateTTS(text, voiceModel.id);

      if (response.success) {
        setGeneratedAudioUrl(`${API_BASE_URL}${response.audioUrl}`);
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

  const handleExportAudio = async (format: string) => {
    if (!generatedAudioUrl) return;

    try {
      const response = await fetch(generatedAudioUrl);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated_speech_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`${format.toUpperCase()}格式导出成功`, 'success');
    } catch (error) {
      showToast('导出失败', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重新开始吗？当前的语音模型将会丢失。')) {
      setAudioBlob(null);
      setVoiceModel(null);
      setGeneratedAudioUrl(null);
      setCurrentStep(1);
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
          <StepIndicator currentStep={currentStep} totalSteps={2} />

          {/* 录音步骤 */}
          {currentStep === 1 && (
            <Section>
              <SectionTitle>
                <span>🎤</span>
                <span>录制您的声音</span>
              </SectionTitle>
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            </Section>
          )}

          {/* 处理步骤 */}
          {currentStep === 2 && (
            <Section>
              <SectionTitle>
                <span>⚙️</span>
                <span>声音处理</span>
              </SectionTitle>
              <ProcessContainer>
                <UploadArea isProcessing={isProcessing}>
                  {isProcessing ? (
                    <>
                      <ProgressText>正在处理您的声音...</ProgressText>
                      <ProgressBar>
                        <ProgressFill progress={processingProgress} />
                      </ProgressBar>
                      <p>{processingProgress}%</p>
                    </>
                  ) : voiceModel ? (
                    <SuccessCard>
                      <h3>✅ 声音模型创建成功！</h3>
                      <p>您的声音ID: {voiceModel.id}</p>
                      <NextButton onClick={() => setCurrentStep(3)}>
                        下一步：生成语音 →
                      </NextButton>
                    </SuccessCard>
                  ) : (
                    <div>
                      <p>等待音频处理...</p>
                    </div>
                  )}
                </UploadArea>
              </ProcessContainer>
            </Section>
          )}

          {/* 文本输入步骤 */}
          {currentStep === 3 && (
            <Section>
              <TextInput onGenerateSpeech={handleGenerateSpeech} isLoading={isProcessing} />
            </Section>
          )}

          {/* 结果步骤 */}
          {currentStep === 4 && generatedAudioUrl && (
            <Section>
              <SectionTitle>
                <span>🔊</span>
                <span>生成的语音</span>
              </SectionTitle>

              <AudioPlayer>
                <audio controls style={{ width: '100%', maxWidth: '500px' }}>
                  <source src={generatedAudioUrl} type="audio/mpeg" />
                  您的浏览器不支持音频播放
                </audio>
              </AudioPlayer>

              <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '25px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>导出选项</h3>
                <ExportButtons>
                  <ExportButton className="primary" onClick={() => handleExportAudio('mp3')}>
                    <span>💾</span>
                    <span>导出 MP3</span>
                  </ExportButton>
                  <ExportButton className="success" onClick={() => handleExportAudio('wav')}>
                    <span>💾</span>
                    <span>导出 WAV</span>
                  </ExportButton>
                </ExportButtons>
              </div>

              <ActionButtons>
                <button onClick={handleReset} style={{
                  padding: '12px 24px',
                  border: '1px solid #e8e8e8',
                  borderRadius: '12px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer'
                }}>
                  🔄 重新录制
                </button>
                <button onClick={() => setCurrentStep(3)} style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#5e7ce6',
                  color: 'white',
                  cursor: 'pointer'
                }}>
                  ➕ 生成更多
                </button>
              </ActionButtons>
            </Section>
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

export default App;

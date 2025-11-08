import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, modelName?: string) => void;
}

const RecorderContainer = styled.div`
  text-align: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const VisualizerCanvas = styled.canvas`
  width: 100%;
  height: 160px;
  background: #f0f2f5;
  border-radius: 12px;
  margin-bottom: 30px;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const RecordButton = styled.button<{ isRecording?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
  background: ${props => props.isRecording ? '#f5222d' : '#5e7ce6'};
  color: white;
  animation: ${props => props.isRecording ? 'pulse 1.5s infinite' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const StatusText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
`;

const HintText = styled.p`
  color: #5e7ce6;
  font-weight: 500;
  margin-bottom: 15px;
`;

const SampleText = styled.div`
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  text-align: left;

  p {
    line-height: 1.8;
    color: #333;
    font-style: italic;
    margin: 0;
  }
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #5e7ce6;
  margin-top: 20px;
`;

const ModelNameInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #5e7ce6;
    box-shadow: 0 0 0 2px rgba(94, 124, 230, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InputLabel = styled.label`
  display: block;
  text-align: left;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [modelName, setModelName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, width, height);

    // 绘制静态波形
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (isRecording && streamRef.current) {
      // 如果正在录音，绘制实时波形
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(streamRef.current);

      source.connect(analyser);
      analyser.fftSize = 2048;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) return;

        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#f0f2f5';
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#5e7ce6';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      };

      draw();
    }
  }, [isRecording]);

  useEffect(() => {
    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawWaveform]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        onRecordingComplete(audioBlob, modelName || undefined);
      };

      mediaRecorder.start();
      recordingStartTime.current = Date.now();
      setIsRecording(true);

      // 开始计时
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime.current) / 1000);
        setRecordingTime(elapsed);
      }, 1000);

    } catch (error) {
      console.error('录音失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setModelName('');
    setRecordingTime(0);
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <RecorderContainer>
      <VisualizerCanvas
        ref={canvasRef}
        width={800}
        height={200}
      />

      {/* 模型名称输入框 */}
      {!isRecording && (
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <InputLabel>声音模型名称（可选）</InputLabel>
          <ModelNameInput
            type="text"
            placeholder="例如：我的声音、客服声音等..."
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            disabled={isRecording}
          />
        </div>
      )}

      <ControlsContainer>
        {!isRecording ? (
          <>
            <RecordButton onClick={startRecording}>
              <span>🎤</span>
              <span>开始录音</span>
            </RecordButton>
            {audioBlob && (
              <RecordButton onClick={resetRecording}>
                <span>🔄</span>
                <span>重新录音</span>
              </RecordButton>
            )}
          </>
        ) : (
          <RecordButton onClick={stopRecording} isRecording>
            <span>⏹️</span>
            <span>停止录音</span>
          </RecordButton>
        )}

        {audioBlob && !isRecording && (
          <RecordButton onClick={playRecording}>
            <span>▶️</span>
            <span>播放录音</span>
          </RecordButton>
        )}
      </ControlsContainer>

      {!isRecording && !audioBlob && (
        <>
          <StatusText>请点击"开始录音"按钮，录制您的声音样本</StatusText>
          <HintText>建议朗读以下文本，录制10-30秒：</HintText>
          <SampleText>
            <p>"你好，欢迎使用AI语音复刻技术。今天天气很好，我心情也很愉快。这个产品可以帮助用户创建个性化的语音内容，让科技更加贴近生活。"</p>
          </SampleText>
        </>
      )}

      {audioBlob && !isRecording && (
        <div>
          <StatusText>录音完成！点击"播放录音"预览，声音模型将自动创建</StatusText>
          {modelName && (
            <StatusText>模型名称：{modelName}</StatusText>
          )}
        </div>
      )}

      {isRecording && recordingTime > 0 && (
        <Timer>录音时长: {formatTime(recordingTime)}</Timer>
      )}
    </RecorderContainer>
  );
};
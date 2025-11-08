import React, { useState } from 'react';
import styled from 'styled-components';

interface TextInputProps {
  onGenerateSpeech: (text: string) => void;
  isLoading?: boolean;
}

const TextInputContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  color: #5e7ce6;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const TextAreaWrapper = styled.div`
  position: relative;
  margin-bottom: 30px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 20px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #5e7ce6;
    box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.1);
  }
`;

const CharCounter = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  font-size: 12px;
  color: #999;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
`;

const PresetSection = styled.div`
  margin-bottom: 30px;
`;

const PresetTitle = styled.p`
  font-weight: 500;
  color: #666;
  margin-bottom: 15px;
  text-align: center;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PresetButton = styled.button`
  background: white;
  border: 1px solid #e8e8e8;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #5e7ce6;
    color: #5e7ce6;
    background: rgba(94, 124, 230, 0.05);
  }
`;

const GenerateButton = styled.button<{ isLoading?: boolean }>`
  width: 100%;
  background: linear-gradient(135deg, #5e7ce6, #4a63b8);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  &:disabled {
    background: #999;
    cursor: not-allowed;
    transform: none;
  }
`;

const presetTexts = [
  "欢迎使用AI语音复刻技术，这是用您的声音生成的语音。",
  "人工智能正在改变我们的生活方式，让未来充满无限可能。",
  "今天是个美好的一天，希望您心情愉快，万事如意。"
];

export const TextInput: React.FC<TextInputProps> = ({ onGenerateSpeech, isLoading }) => {
  const [text, setText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= 1000) {
      setText(newText);
    }
  };

  const setPresetText = (presetText: string) => {
    setText(presetText);
  };

  const handleGenerate = () => {
    if (text.trim()) {
      onGenerateSpeech(text.trim());
    }
  };

  const getCharCountColor = () => {
    if (text.length > 800) return '#f5222d';
    if (text.length > 600) return '#faad14';
    return '#999';
  };

  return (
    <TextInputContainer>
      <Title>
        <span>📝</span>
        <span>输入要转换的文本</span>
      </Title>

      <TextAreaWrapper>
        <TextArea
          value={text}
          onChange={handleTextChange}
          placeholder="请输入您想要转换为语音的文本内容..."
          maxLength={1000}
        />
        <CharCounter style={{ color: getCharCountColor() }}>
          {text.length}/1000
        </CharCounter>
      </TextAreaWrapper>

      <PresetSection>
        <PresetTitle>快速示例：</PresetTitle>
        <PresetButtons>
          {presetTexts.map((presetText, index) => (
            <PresetButton
              key={index}
              onClick={() => setPresetText(presetText)}
            >
              示例{index + 1}
            </PresetButton>
          ))}
        </PresetButtons>
      </PresetSection>

      <GenerateButton
        onClick={handleGenerate}
        disabled={!text.trim() || isLoading}
        isLoading={isLoading}
      >
        {isLoading ? (
          <>
            <span>⏳</span>
            <span>生成中...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>生成语音</span>
          </>
        )}
      </GenerateButton>
    </TextInputContainer>
  );
};
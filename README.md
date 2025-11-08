# 🎤 AI语音复刻应用

一个基于React + TypeScript的智能语音复刻和文本转语音应用，支持多种音频格式导出和移动端访问。

## ✨ 功能特性

- **🎙️ 语音录制**: 高质量录音，实时波形可视化
- **🤖 AI语音复刻**: 基于豆包AI的语音模型创建
- **💬 文本转语音**: 自然语音合成，支持多种音调
- **📱 响应式设计**: 完美适配桌面和移动设备
- **🎧 多格式导出**: 支持MP3、WAV格式下载
- **🔄 实时处理**: 快速的语音处理和生成
- **🌐 跨网络访问**: 支持局域网和互联网访问

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
# 启动开发服务器（局域网访问）
npm run dev:public

# 或者仅启动前端
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 移动端访问

### 局域网访问
1. 确保手机和电脑在同一WiFi网络
2. 查看电脑IP地址（在终端运行 `ifconfig`）
3. 在手机浏览器访问：`http://[电脑IP]:3000`

### 生产环境访问
部署后访问：`https://guanshanzhi707-bit.github.io/ai-voice-clone-react`

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript
- **样式**: Styled Components
- **状态管理**: React Hooks
- **音频处理**: Web Audio API
- **HTTP客户端**: Axios
- **后端**: Node.js + Express
- **AI服务**: 豆包语音API

## 📦 项目结构

```
├── src/
│   ├── components/          # React组件
│   │   ├── AudioRecorder.tsx
│   │   ├── TextInput.tsx
│   │   └── StepIndicator.tsx
│   ├── services/           # API服务
│   │   └── api.ts
│   ├── SimpleApp.tsx       # 主应用组件
│   └── index.tsx           # 应用入口
├── api/                    # Vercel Functions
├── public/                 # 静态资源
├── server.js              # 后端服务器
└── package.json
```

## 🚀 部署

### GitHub Pages部署
```bash
# 一键部署到GitHub Pages
./deploy.sh
```

### Vercel部署
```bash
# 部署到Vercel
npm run build
npx vercel --prod
```

## ⚙️ 环境配置

创建 `.env.backend` 文件：
```env
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_APP_ID=你的豆包应用ID
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
```

## 🎯 使用指南

### 1. 声音复刻
- 点击"开始录音"录制声音样本
- 录制完成后自动创建语音模型
- 可以为模型命名便于管理

### 2. 文本转语音
- 选择已创建的语音模型
- 输入要转换的文本
- 点击生成并下载音频文件

### 3. 导出功能
- 支持MP3和WAV格式
- 可以下载生成的音频文件
- 支持批量处理

## 🔧 开发脚本

```bash
npm start              # 启动开发服务器
npm run start:public   # 启动局域网访问模式
npm run build          # 构建生产版本
npm run build:gh       # 构建GitHub Pages版本
npm run deploy         # 部署到GitHub Pages
npm run server         # 启动后端服务器
npm run dev            # 同时启动前后端
npm test               # 运行测试
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issues和Pull Requests！

---

**🎉 体验AI语音技术的魅力，创造属于你的个性化语音内容！**
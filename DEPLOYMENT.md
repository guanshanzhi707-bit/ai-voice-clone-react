# AI语音复刻应用部署指南

## 🚀 快速部署到Vercel

### 1. 准备工作
- 安装Node.js 18+
- 注册[Vercel账号](https://vercel.com)
- 安装Vercel CLI: `npm i -g vercel`

### 2. 部署步骤

#### 第一步：登录Vercel
```bash
vercel login
```

#### 第二步：构建并部署前端
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到Vercel
vercel --prod
```

#### 第三步：配置环境变量
在Vercel控制台设置以下环境变量：

```
NODE_ENV=production
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_API_SECRET=你的豆包API密钥
DOUBAO_APP_ID=你的豆包应用ID
DOUBAO_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
FRONTEND_URL=https://你的域名.vercel.app
```

### 3. 域名配置

#### 获取自定义域名
1. 在Vercel控制台点击"Domains"
2. 添加你的自定义域名
3. 配置DNS解析：
   ```
   类型: CNAME
   名称: @ (或www)
   值: cname.vercel-dns.com
   ```

#### 部署后API地址
- 前端: `https://你的域名.vercel.app`
- API: `https://你的域名.vercel.app/api`

### 4. 测试部署

#### 本地预览
```bash
# 启动本地预览
npm start
```

#### 部署后测试
访问 `https://你的域名.vercel.app` 测试所有功能：
- ✅ 健康检查: `/health`
- ✅ 音频上传: `/api/upload-audio`
- ✅ 语音模型创建: `/api/create-voice-model`
- ✅ TTS生成: `/api/generate-tts`

## 🛠️ 技术架构

### 前端 (React)
- **框架**: React 18 + TypeScript
- **样式**: Styled Components
- **构建**: Create React App
- **部署**: Vercel Static

### 后端 (Vercel Functions)
- **运行时**: Node.js 18.x
- **框架**: Express.js
- **文件上传**: Multer
- **API集成**: 豆包语音复刻API

### 文件结构
```
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── services/          # API���务
│   └── SimpleApp.tsx      # 主应用
├── api/                   # Vercel Functions
│   └── server.js          # 后端API
├── public/               # 静态资源
├── vercel.json          # Vercel配置
└── package.json         # 项目配置
```

## 🔧 环境配置

### 开发环境
```bash
# 启动开发服务器
npm run start:public

# 访问地址
# 前端: http://localhost:3000
# 后端: http://localhost:3001
```

### 生产环境
```bash
# 构建并部署
npm run build
vercel --prod
```

## 📱 移动端访问

部署后，手机可通过以下方式访问：
1. **直接访问**: 在手机浏览器输入域名
2. **扫码访问**: 生成二维码供手机扫描
3. **响应式设计**: 自动适配手机屏幕

## 🚨 故障排除

### 常见问题

#### 1. API连接失败
- 检查环境变量是否正确配置
- 确认豆包API密钥有效
- 查看Vercel Functions日志

#### 2. 文件上传失败
- 检查文件大小是否超过50MB
- 确认音频格式是否支持
- 查看CORS配置

#### 3. TTS生成失败
- 验证语音模型ID是否存在
- 检查文本内容是否合法
- 确认API调用限额

### 调试命令
```bash
# 查看部署日志
vercel logs

# 本地调试
vercel dev

# 检查环境变量
vercel env ls
```

## 📊 监控和维护

### 性能监控
- Vercel Analytics: 访问量统计
- Vercel Speed Insights: 性能分析
- 错误日志: 实时错误追踪

### 更新部署
```bash
# 提交代码后自动部署
git add .
git commit -m "更新功能"
git push origin main

# 或手动部署
vercel --prod
```

## 💰 成本控制

### Vercel免费额度
- **带宽**: 100GB/月
- **函数调用**: 100万次/月
- **构建时间**: 6000分钟/月

### 优化建议
- 压缩音频文件减少带宽占用
- 使用CDN加速静态资源
- 监控API调用频率

---

🎉 **恭喜！你的AI语音复刻应用已成功部署到互联网！**
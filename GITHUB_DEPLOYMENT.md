# 🚀 GitHub Pages 部署指南

## 📋 部署方案选择

### 方案一：纯前端部署（推荐）
- ✅ **完全免费**
- ✅ **部署简单**
- ✅ **GitHub原生支持**
- ⚠️ **需要外部API服务**（豆包API直接调用）

### 方案二：前端+后端分离部署
- ✅ **功能完整**
- ✅ **可控性强**
- ✅ **支持文件上传**
- ⚠️ **后端需要单独部署**（Vercel/Netlify）

---

## 🎯 方案一：纯前端部署步骤

### 1. 准备GitHub仓库

```bash
# 创建GitHub仓库（假设仓库名为 ai-voice-clone-react）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/[你的用户名]/ai-voice-clone-react.git
git branch -M main
git push -u origin main
```

### 2. 修改配置

1. **更新package.json中的homepage**
   ```json
   "homepage": "https://[你的GitHub用户名].github.io/ai-voice-clone-react"
   ```

2. **修改API配置** - 由于GitHub Pages不支持后端，需要：
   - 使用豆包API的直接JavaScript SDK
   - 或使用第三方API代理服务

### 3. 部署到GitHub Pages

```bash
# 自动部署
npm run deploy
```

### 4. 启用GitHub Pages

1. 进入GitHub仓库
2. Settings → Pages
3. Source选择 "Deploy from a branch"
4. Branch选择 "gh-pages" 和 "/ (root)"
5. 点击Save

### 5. 访问应用

部署成功后访问：`https://[你的GitHub用户名].github.io/ai-voice-clone-react`

---

## 🎯 方案二：前后端分离部署

### 1. 前端部署到GitHub Pages

```bash
# 1. 克隆仓库
git clone https://github.com/[你的用户名]/ai-voice-clone-react.git
cd ai-voice-clone-react

# 2. 配置API地址
# 在src/services/api.ts中设置后端API地址
const API_BASE_URL = 'https://your-backend.vercel.app'

# 3. 部署前端
npm run deploy
```

### 2. 后端部署到Vercel

```bash
# 1. 创建api文件夹并移动server.js
mkdir api
mv server.js api/

# 2. 部署到Vercel
npx vercel --prod
```

### 3. 配置环境变量

在Vercel控制台设置：
- `DOUBAO_API_KEY`
- `DOUBAO_APP_ID`
- `DOUBAO_ENDPOINT`

---

## 🔧 快速部署脚本

### 自动化部署脚本
```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署到GitHub Pages..."

# 1. 提交当前更改
git add .
git commit -m "Update for deployment"

# 2. 推送到GitHub
git push origin main

# 3. 部署到GitHub Pages
npm run deploy

echo "✅ 部署完成！"
echo "🌐 访问地址: https://[你的用户名].github.io/ai-voice-clone-react"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📱 测试部署

### 本地预览
```bash
# 预览生产构建
npm run build
npx serve -s build
```

### 部署后检查
1. 访问GitHub Pages地址
2. 检查所有页面是否正常加载
3. 测试移动端响应式
4. 验证API连接状态

---

## 🛠️ 常见问题解决

### 1. 页面刷新404
**问题**：React Router在GitHub Pages上刷新后404

**解决**：已配置404.html重定向
```bash
npm run build:gh  # 自动复制index.html为404.html
```

### 2. API连接失败
**问题**：CORS错误或API不可达

**解决**：
- 使用方案二（前后端分离）
- 或配置豆包API支持CORS

### 3. 静态资源加载失败
**问题**：CSS、JS文件404

**解决**：检查package.json中的homepage配置

### 4. 部署后样式丢失
**问题**：Styled Components或其他样式不生效

**解决**：确保构建时没有错误，检查CSS加载顺序

---

## 🎉 部署成功标志

✅ **页面正常加载**
✅ **响应式设计工作**
✅ **API连接正常**
✅ **移动端访问正常**
✅ **语音录制功能正常**
✅ **TTS生成功能正常**

---

## 📞 维护和更新

### 更新应用
```bash
# 1. 修改代码
git add .
git commit -m "Update features"
git push origin main

# 2. 重新部署
npm run deploy
```

### 监控状态
- GitHub Pages在仓库Settings中查看部署状态
- 使用Google Analytics监控访问量
- 定期检查API调用限额

---

## 🌟 最佳实践

1. **版本管理**：使用Git tags标记版本
2. **环境配置**：区分开发和生产环境
3. **性能优化**：启用Gzip压缩和CDN
4. **安全考虑**：不要在前端暴露敏感API密钥
5. **SEO优化**：添加meta标签和sitemap

---

🎊 **恭喜！你的AI语音复刻应用现在可以在GitHub Pages上访问了！**
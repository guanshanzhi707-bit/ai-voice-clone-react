#!/bin/bash

# AI语音复刻应用 - GitHub Pages 部署脚本

echo "🚀 开始部署AI语音复刻应用到GitHub Pages..."

# 检查Git状态
if ! git status --porcelain; then
    echo "✅ 工作目录干净，继续部署..."
else
    echo "⚠️  有未提交的更改，正在提交..."
    git add .
    git commit -m "Auto-commit before deployment - $(date)"
fi

# 检查是否已配置远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ 未找到远程仓库，请先配置："
    echo "git remote add origin https://github.com/[你的用户名]/ai-voice-clone-react.git"
    exit 1
fi

# 推送到GitHub
echo "📤 推送代码到GitHub..."
git push origin main

# 构建和部署
echo "🔨 构建应用..."
npm run build:gh

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🚀 部署到GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📋 部署信息："
    echo "   - 仓库地址: $(git remote get-url origin)"
    echo "   - 部署分支: gh-pages"
    echo "   - 构建目录: build/"
    echo ""
    echo "🌐 访问地址："
    echo "   https://guanshanzhi707-bit.github.io/ai-voice-clone-react"
    echo ""
    echo "📱 测试建议："
    echo "   1. 在手机浏览器测试访问"
    echo "   2. 测试语音录制功能"
    echo "   3. 验证响应式设计"
    echo ""
else
    echo "❌ 部署失败！"
    exit 1
fi
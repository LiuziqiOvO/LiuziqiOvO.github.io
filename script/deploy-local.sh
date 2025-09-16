#!/bin/bash

# 确保脚本在出错时退出
set -e

echo "===== 开始本地部署 Hexo 博客 ====="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未检测到 npm，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "正在安装依赖..."
npm install

# 清理旧的构建
echo "正在清理旧的构建..."
npm run clean

# 生成静态文件
echo "正在生成静态文件..."
npm run build

# 启动服务器
echo "正在启动 Hexo 服务器..."
echo "您可以通过 Ctrl+C 停止服务器"
echo "===== Hexo 博客已成功启动 ====="
echo "您可以通过 http://localhost:4000 访问您的博客"
npm run server 
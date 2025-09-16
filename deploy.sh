#!/bin/bash

# 确保脚本在出错时退出
set -e

echo "===== 开始部署 Hexo 博客 ====="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未检测到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 设置Docker镜像源
echo "正在设置Docker镜像源..."
DOCKER_CONFIG_DIR="/etc/docker"
DOCKER_CONFIG_FILE="$DOCKER_CONFIG_DIR/daemon.json"

# 检查是否有权限修改Docker配置
if [ -w "$DOCKER_CONFIG_DIR" ] || [ -w "$DOCKER_CONFIG_FILE" ] || [ $(id -u) -eq 0 ]; then
    # 如果daemon.json不存在，则创建
    if [ ! -f "$DOCKER_CONFIG_FILE" ]; then
        sudo mkdir -p "$DOCKER_CONFIG_DIR"
        echo '{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}' | sudo tee "$DOCKER_CONFIG_FILE" > /dev/null
        echo "已创建Docker镜像源配置"
        
        # 重启Docker服务
        echo "正在重启Docker服务..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl restart docker
        elif command -v service &> /dev/null; then
            sudo service docker restart
        else
            echo "警告: 无法自动重启Docker服务，请手动重启"
        fi
    else
        echo "Docker配置文件已存在，跳过设置镜像源"
    fi
else
    echo "警告: 无权限修改Docker配置，跳过设置镜像源"
fi

# 构建并启动Docker容器
echo "正在构建并启动 Docker 容器..."
docker-compose up -d --build

# 等待容器启动
echo "等待容器启动..."
sleep 5

# 显示容器状态
echo "容器状态:"
docker-compose ps

# 提供一些有用的命令
echo -e "\n===== Hexo 博客已成功部署 ====="
echo "您可以通过 http://localhost:4000 访问您的博客"
echo -e "\n常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart" 
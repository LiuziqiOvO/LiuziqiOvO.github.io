# Hexo 博客容器化部署信息

## 项目状态

- 项目类型: Hexo 博客
- 主题: butterfly
- 容器化状态: 已完成 Docker 和 Docker Compose 配置

## 容器化文件

- Dockerfile: 标准 Docker 镜像配置
- Dockerfile.simple: 简化版 Docker 镜像配置（不依赖特定版本的 Node 镜像）
- docker-compose.yml: 容器编排配置
- deploy.sh: 标准部署脚本（设置 Docker 镜像源）
- deploy-simple.sh: 简化版部署脚本（使用 alpine 基础镜像）
- deploy-local.sh: 本地部署脚本（不使用 Docker）
- .dockerignore: Docker 构建时忽略的文件

## 部署方式（三选一）

### 1. 标准 Docker 部署（需要网络访问 Docker Hub）

```bash
./deploy.sh
```

### 2. 简化版 Docker 部署（使用 alpine 基础镜像）

```bash
./deploy-simple.sh
```

### 3. 本地部署（不使用 Docker，直接使用本地 Node.js）

```bash
./deploy-local.sh
```

访问: http://localhost:4000

## 容器结构

- 单容器运行 Hexo 服务器，提供博客服务
- 通过挂载卷实现源文件的实时更新

## 挂载卷

- ./source:/app/source
- ./themes:/app/themes
- ./\_config.yml:/app/\_config.yml
- ./\_config.butterfly.yml:/app/\_config.butterfly.yml

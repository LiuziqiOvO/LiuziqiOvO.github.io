---
title: S3 对象存储
date: 2026-08-17 05:00:00
categories:
  - 存储系统
tags:
  - 存储系统
  - S3 对象存储
  - storage-object-storage
description: 1:1 发布自知识库：Storage/S3 对象存储.md
source_note: Storage/S3 对象存储.md
---
# S3 对象存储

S3（Amazon Simple Storage Service）是 AWS 的对象存储服务，面向海量非结构化数据，提供按 bucket 管理、按 key 寻址、通过 REST API / SDK 访问的存储模型。它强调高扩展性、高持久性、跨可用区容灾、生命周期、权限、复制和事件通知能力，适合做数据湖、备份归档、静态资源存储和分析任务的数据底座。

## 核心对象模型

- **Bucket**：对象容器，也是权限、计费、生命周期、复制、事件通知等策略的主要作用边界。
- **Object**：S3 的基本存储单元，由对象数据和元数据组成。
- **Key**：对象在 bucket 内的唯一标识；S3 本质上是 `bucket + key (+ version)` 到对象内容的映射。`a/b/c.txt` 这类“目录”主要是 key 前缀语义，不是传统文件系统目录。
- **Metadata**：描述对象的键值对，包含系统元数据和用户自定义元数据；`HEAD Object` 可读取对象元数据。
- **Version ID**：启用 Versioning 后，同一 key 的不同版本用 version ID 区分，适合误删恢复和覆盖保护。

## 一致性、可用性与场景

- **一致性**：S3 对对象 `PUT`、覆盖写和 `DELETE` 提供强读后写一致性；成功写入后，后续 `GET` 和 `LIST` 能看到最新结果。单个 key 更新是原子的，但不支持跨 key 原子事务；同一 key 并发写通常按 last-writer-wins 理解。
- **配置边界**：bucket 配置仍可能有最终一致性边界，例如首次开启 versioning 后官方建议等待一段时间再执行对象写操作。
- **可用性/持久性**：`S3 Standard` 设计目标为 `99.99% availability`、`99.999999999% durability`；多 AZ 存储类型可承受一个可用区故障，`One Zone` 类成本更低但故障域更窄。
- **适合场景**：数据湖、备份恢复、归档、日志与埋点原始数据、静态网站资源、移动/Web 应用文件、机器学习训练数据和分析任务输入输出。
- **不适合场景**：需要 POSIX 语义、低延迟细粒度随机覆写、跨对象事务、块设备级挂载的场景。

## 与 HDFS、块存储的区别

### 与 HDFS

- **抽象层次**：S3 是对象存储，核心是 bucket/object/key；[[HDFS]] 是分布式文件系统，核心是文件/block、NameNode/DataNode。
- **访问方式**：S3 主要通过 HTTP REST API、SDK、CLI 访问；HDFS 通过文件系统/大数据生态接口访问，紧耦合 Hadoop/Spark/MapReduce。
- **一致性与更新模型**：S3 对单对象提供强一致读取，但不支持跨 key 原子更新，覆盖通常是整对象级；HDFS 偏 write-once-read-many、大文件顺序吞吐和 append，不擅长任意位置随机修改。
- **计算亲和性**：HDFS 强调数据本地性，适合把计算调度到数据附近；S3 更像独立存储底座，计算与存储解耦，适合云上弹性分析和多服务共享。
- **运维边界**：S3 是托管服务；HDFS 通常需要自管集群、节点、副本、NameNode 高可用和扩容策略。

### 与块存储

- **接口形态**：S3 提供对象 API，不直接暴露块设备；块存储把卷暴露给主机，由操作系统或数据库自行建立文件系统和数据结构。
- **数据组织**：S3 自带 bucket/key 命名空间和对象元数据；块存储只提供地址空间，不理解“文件”“对象”“元数据”语义。
- **性能与访问模式**：块存储适合低延迟随机读写、数据库页、文件系统底层卷；S3 更适合大规模对象、共享数据集、冷热分层、归档和高耐久保存。
- **共享与扩展**：S3 天然是服务化共享存储，容量和对象数可横向扩展；块存储更像单机或少量挂载实例使用的底层存储介质。

## 参考

- [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Amazon S3 API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html)
- [Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Amazon S3 access management](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html)

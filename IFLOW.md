# RailGo-UniApp 项目说明

## 项目概述

RailGo 是一个现代化的专业铁路查询工具，基于 uni-app 框架开发，支持多端部署（包括移动端、小程序、H5等）。该应用提供车次查询、车站信息、实时测速、动车组信息等多项铁路相关服务。项目使用 Vue 3 作为主要框架，结合 FirstUI 组件库构建用户界面，并通过 SQLite 数据库存储本地数据。

## 技术架构

- **前端框架**: uni-app (Vue 3)
- **UI 组件库**: FirstUI
- **数据库**: SQLite (移动端) / Flask API (H5端)
- **后端 API**: Flask (Python)
- **网络请求**: 自定义 axios 适配器
- **状态管理**: uni-app 原生存储

## 主要功能模块

- **车次查询**: 查询列车时刻表、开行日等信息
- **车站查询**: 查询车站通过车次、线路等信息
- **实时测速**: 使用 GPS 进行实时速度测试
- **动车组查询**: 查询动车组配属和运行交路
- **雷达功能**: (开发中) 预测附近经过的列车

## 项目结构

```
RailGo-UniApp/
├── App.vue                 # 应用主入口组件
├── main.js                 # 应用主入口文件
├── manifest.json           # 应用配置文件
├── pages.json              # 页面路由配置
├── pages/                  # 页面组件目录
│   ├── index/              # 主页
│   ├── train/              # 车次查询相关页面
│   ├── station/            # 车站查询相关页面
│   ├── emu/                # 动车组查询相关页面
│   ├── speed/              # 实时测速页面
│   └── ...                 # 其他页面
├── components/             # 公共组件目录
├── scripts/                # 工具脚本目录
│   ├── req.js              # 网络请求封装
│   ├── sqlite.js           # SQLite 数据库操作
│   └── config.js           # 配置文件
├── api/                    # 后端 API 目录 (Flask)
├── static/                 # 静态资源目录
├── uni_modules/            # uni-app 模块目录
└── ...
```

## 核心文件说明

### main.js
应用的主入口文件，根据编译模式 (Vue 2/3) 初始化应用实例。

### App.vue
应用的根组件，定义全局样式和应用生命周期。

### manifest.json
uni-app 应用配置文件，包含应用基本信息、权限配置、发布信息等。

### pages.json
页面路由和窗口配置文件，定义应用的页面路径和窗口表现。

### pages/index/index.vue
应用主页，展示功能入口、公告、统计数据和横幅广告。

### scripts/req.js
封装 uni.request 为类似 axios 的 API，提供 GET 和 POST 请求方法。

### scripts/sqlite.js
SQLite 数据库操作封装，支持 APP 端和 H5 端的不同实现。

### api/test_api.py
Flask API 的测试脚本，包含对各项功能的测试用例。

## 构建与运行

### 环境要求

- Node.js 14+ 
- HBuilderX 或其他支持 uni-app 的开发工具

### 依赖安装

```bash
# 使用 npm
npm install firstui-uni
```

### 运行项目

```bash
# 开发模式
npm run dev:mp-weixin  # 微信小程序
npm run dev:app        # App
npm run dev:h5         # H5
```

### 构建项目

```bash
# 构建指定平台
npm run build:mp-weixin  # 微信小程序
npm run build:app        # App
npm run build:h5         # H5
```

## API 后端 (Flask)

### 依赖

```
Flask==2.3.3
Flask-CORS==4.0.0
Werkzeug==2.3.7
```

### API 测试

使用 `api/test_api.py` 脚本来测试 Flask API 的各项功能，包括：

- 根路径
- 健康检查
- 鉴权接口
- 车次查询
- 站点查询
- 数据库更新
- 错误处理

## 开发约定

### 组件规范

项目采用 FirstUI 组件库，通过 easycom 规范自动引入组件，无需手动注册。

### 数据处理

- APP 端使用 SQLite 进行本地数据存储
- H5 端通过 Flask API 与后端进行数据交互
- 使用 `scripts/sqlite.js` 统一处理数据库操作

### 网络请求

通过 `scripts/req.js` 中封装的 `uniGet` 和 `uniPost` 方法进行网络请求，模拟 axios 的使用方式。

### 存储管理

使用 uni-app 的 `uni.getStorageSync` 和 `uni.setStorage` 方法进行本地数据存储和管理。

## 鉴权机制

应用采用基于版本和用户凭证的鉴权机制，通过 API 接口验证用户权限，确保应用的安全性。

## 关键配置

- **应用名称**: RailGo
- **版本**: 1.0.5
- **Vue 版本**: 3
- **全局样式**: 自定义主题色 (#114598)
- **导航栏**: 自定义样式，白色文字，蓝色背景
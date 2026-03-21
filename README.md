# 智能招聘平台 - 前端项目

基于 Vue 3 + TypeScript + Element Plus 开发的智能招聘平台前端项目。

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **路由管理**: Vue Router
- **HTTP客户端**: Axios

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # 公共组件
├── router/         # 路由配置
│   └── index.ts    # 路由定义和守卫
├── stores/         # 状态管理
│   └── userStore.ts # 用户状态管理
├── types/          # 类型定义
│   └── index.ts    # 全局类型
├── utils/          # 工具函数
│   └── request.ts  # Axios封装
├── views/          # 页面组件
│   ├── Login.vue   # 登录页面
│   └── Home.vue    # 首页
├── App.vue         # 根组件
├── main.ts         # 应用入口
└── style.css       # 全局样式
```

## 功能模块

### 登录模块 ✅
- 手机号 + 验证码登录
- 角色选择（求职者/企业HR）
- 验证码60秒倒计时
- 表单校验
- 用户状态持久化

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 后端接口配置

后端服务地址：`http://localhost:8080`

相关接口文档请参考 [API_DOCS.md](./API_DOCS.md)

## 开发规范

### 1. 代码风格
- 使用 TypeScript 严格模式
- 组件使用 Composition API + `<script setup>`
- 统一使用中文注释
- 关键逻辑添加详细说明

### 2. 类型定义
- 所有数据结构必须定义 TypeScript 类型
- 接口请求/响应必须明确类型约束
- 禁止使用 `any` 类型（特殊情况需添加注释说明）

### 3. 命名规范
- 文件名：`camelCase` (如：`userStore.ts`)
- 组件名：`PascalCase` (如：`Login.vue`)
- 常量：`UPPER_SNAKE_CASE` (如：`API_BASE_URL`)
- 函数/变量：`camelCase` (如：`handleLogin`)

## 后续开发计划

### 第一阶段（基础版）
- [x] 登录/注册模块
- [ ] 企业岗位管理
- [ ] 求职者简历管理
- [ ] 简历投递功能
- [ ] 职位浏览与筛选

### 第二阶段（AI增强版）
- [ ] 简历智能解析
- [ ] 岗位-简历智能匹配
- [ ] AI文字面试
- [ ] 智能推荐系统

## 注意事项

1. **环境配置**: 开发环境配置在 `.env.development` 文件中
2. **API代理**: Vite 已配置代理，`/api` 请求会自动转发到后端服务
3. **类型安全**: 所有接口调用必须使用 TypeScript 类型约束
4. **状态持久化**: 用户登录状态会自动保存到 localStorage

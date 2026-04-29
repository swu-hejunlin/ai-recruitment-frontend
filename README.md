# AI智能招聘平台 - 前端项目

基于 Vue 3 + TypeScript + Element Plus 开发的AI智能招聘平台前端项目，集成智谱GLM大模型，支持求职者和企业HR双角色。

## 技术栈

- **框架**: Vue 3.5 + TypeScript + Vite 6
- **UI组件库**: Element Plus 2.13
- **状态管理**: Pinia 3 + pinia-plugin-persistedstate
- **路由管理**: Vue Router 5
- **HTTP客户端**: Axios
- **数据可视化**: ECharts 5 + echarts-wordcloud
- **图标**: @element-plus/icons-vue

## 项目结构

```
src/
├── components/              # 可复用组件
│   ├── AppLayout.vue        # 主布局（顶栏+侧边栏+内容区）
│   ├── NotificationCenter.vue # 通知中心（角标+列表）
│   ├── JobDetailDialog.vue  # 职位详情对话框
│   ├── application/         # 投递相关
│   │   ├── ApplicationDetailDialog.vue   # 投递详情
│   │   └── JobSeekerOnlineResumeDialog.vue # 在线简历查看
│   ├── education-experience/
│   │   └── EducationManager.vue          # 教育经历管理
│   ├── interview/           # 面试相关
│   │   ├── InterviewHeader.vue           # 面试头部
│   │   ├── InteractiveQuestion.vue       # 交互式面试题
│   │   ├── QuestionList.vue              # 面试题列表
│   │   ├── VideoRecorder.vue             # 视频录制
│   │   └── EvaluationResult.vue          # 评估结果展示
│   ├── position/            # 职位相关
│   │   ├── BossPositionList.vue          # Boss职位列表
│   │   ├── JobCard.vue                   # 职位卡片（统一组件）
│   │   ├── PositionDetailEnhanced.vue    # 增强版职位详情
│   │   ├── PositionDetailView.vue        # 职位详情视图
│   │   └── PositionForm.vue              # 职位表单
│   ├── project-experience/
│   │   └── ProjectExperienceManager.vue  # 项目经历管理
│   └── work-experience/
│       └── WorkExperienceManager.vue     # 工作经历管理
├── router/
│   └── index.ts             # 路由配置（公共路由+异步路由+守卫）
├── stores/
│   └── userStore.ts         # 用户状态管理（Pinia+持久化）
├── types/
│   └── index.ts             # 全局TypeScript类型定义（40+类型）
├── utils/
│   ├── api.ts               # API接口层（50+接口）
│   └── request.ts           # Axios封装（拦截器+错误处理）
├── views/                   # 页面视图
│   ├── Home.vue             # 首页
│   ├── Login.vue            # 登录页
│   ├── JobSeekerProfile.vue # 求职者简历管理
│   ├── CompanyProfile.vue   # 企业信息管理
│   ├── JobFinder.vue        # 岗位发现（推荐+搜索）
│   ├── BossPositionManager.vue # Boss职位管理
│   ├── BossApplications.vue # Boss投递管理
│   ├── SeekerApplications.vue # 求职者投递记录
│   ├── CompanyDetail.vue    # 公司详情
│   ├── BossInterviewManager.vue # Boss面试管理
│   ├── SeekerInterviewList.vue  # 求职者面试列表
│   ├── FavoriteManager.vue  # 收藏管理
│   ├── ResumeAnalyzer.vue   # 简历AI分析
│   ├── Statistics.vue       # 数据统计
│   ├── TalentProfile.vue    # 人才画像
│   └── mock-interview/      # AI面试模块
│       ├── MockInterview.vue  # 模拟面试
│       └── RealInterview.vue  # 真实AI面试
├── App.vue                  # 根组件（全局样式+认证检查）
├── main.ts                  # 应用入口
└── style.css                # 全局样式
```

## 功能模块

### 求职者功能
- **登录/注册**：手机号+验证码登录，角色选择，验证码倒计时
- **简历管理**：基本信息、教育/工作/项目经历CRUD、技能标签
- **AI智能填充**：上传简历文件，AI自动提取信息填充表单
- **岗位发现**：AI推荐+关键词搜索+高级筛选（城市/类别/学历/薪资）
- **投递管理**：一键投递、投递状态追踪
- **AI面试**：模拟面试（自由输入岗位）、真实面试（基于邀请）
- **简历AI分析**：上传简历获取AI评估报告
- **人才画像**：AI生成个人能力画像
- **收藏管理**：收藏职位/公司
- **数据统计**：投递数据、热门城市/类别分布、词云

### 企业HR功能
- **企业信息管理**：企业资料、Logo、营业执照、福利标签
- **职位管理**：发布/编辑/删除/开启/关闭职位
- **投递管理**：查看收到的简历、按状态筛选、查看在线简历
- **面试管理**：创建面试邀请、管理面试状态
- **岗位画像**：AI生成岗位能力模型
- **收藏管理**：收藏求职者
- **数据统计**：招聘效果分析、转化率

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

Vite 已配置代理，`/api` 请求会自动转发到后端服务。

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

## 注意事项

1. **环境配置**: 开发环境配置在 `.env.development` 文件中
2. **API代理**: Vite 已配置代理，`/api` 请求会自动转发到后端服务
3. **类型安全**: 所有接口调用必须使用 TypeScript 类型约束
4. **状态持久化**: 用户登录状态会自动保存到 localStorage
5. **角色权限**: 路由守卫根据角色控制页面访问权限
6. **超时设置**: Axios 超时时间为5分钟（支持视频上传和AI分析）

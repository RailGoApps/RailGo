# 📦 发布到 NPM 指南

## ⚠️ 重要说明

**uni_modules 插件有两种发布方式：**

1. **DCloud 插件市场**（推荐）- 这是 uni-app 生态的标准方式
2. **NPM 仓库**（可选）- 方便使用 npm/yarn/pnpm 安装

**两者可以同时发布，互不冲突。**

---

## 🚀 方式一：发布到 DCloud 插件市场（推荐）

### 为什么优先推荐 DCloud 插件市场？

- ✅ **uni-app 原生支持** - HBuilderX 可直接导入
- ✅ **自动更新** - 插件更新用户可直接升级
- ✅ **收益渠道** - 支持付费、赞赏、广告分成
- ✅ **用户群体大** - uni-app 开发者都在这里找插件
- ✅ **评价系统** - 评分、评论、下载量统计

### 发布步骤

1. **在 HBuilderX 中打开项目**
2. **右键点击** `uni_modules/gq-tabbar` 文件夹
3. **选择** "发布到插件市场"
4. **填写插件信息**：
   - 上传 3-5 张效果截图
   - 填写详细说明
   - 选择分类：前端组件 → 通用组件
5. **提交审核**

插件市场地址：https://ext.dcloud.net.cn/

---

## 📦 方式二：发布到 NPM

### 前提条件

1. **拥有 NPM 账号** - https://www.npmjs.com/signup
2. **安装 Node.js** - 已安装（你的项目已有 package.json）
3. **配置 Git 仓库**（可选但推荐）

### 步骤 1：完善 package.json

确保 `package.json` 包含必要的 NPM 字段（已配置）：

```json
{
  "name": "gq-tabbar",           // NPM 包名
  "version": "1.0.0",            // 版本号
  "description": "...",          // 描述
  "main": "components/gq-tabbar/gq-tabbar.vue", // 入口文件
  "author": "gq",                // 作者
  "license": "MIT",              // 开源协议
  "keywords": [...],             // 关键词
  "repository": {                // Git 仓库（建议填写）
    "type": "git",
    "url": "https://github.com/yourusername/gq-tabbar.git"
  }
}
```

### 步骤 2：创建 Git 仓库（可选但推荐）

```bash
cd uni_modules/gq-tabbar

# 初始化 Git 仓库
git init

# 添加文件
git add .

# 提交
git commit -m "feat: 首次发布 gq-tabbar 组件"

# 关联远程仓库（需先在 GitHub/Gitee 创建仓库）
git remote add origin https://github.com/yourusername/gq-tabbar.git

# 推送到远程
git push -u origin main
```

### 步骤 3：登录 NPM

```bash
# 登录 NPM（只需首次登录）
npm login

# 输入你的：
# - Username（用户名）
# - Password（密码）
# - Email（邮箱）
```

### 步骤 4：发布到 NPM

```bash
# 进入插件目录
cd /Users/gq/Documents/tjmc/外卖无人值守/商城小程序/uni_modules/gq-tabbar

# 检查将要发布的文件
npm pack --dry-run

# 发布到 NPM
npm publish

# 如果遇到权限问题，使用：
npm publish --access public
```

### 步骤 5：验证发布

访问：https://www.npmjs.com/package/gq-tabbar

---

## 📝 版本更新流程

### 更新版本号

```bash
cd uni_modules/gq-tabbar

# 修复版本（1.0.0 -> 1.0.1）
npm version patch

# 小版本更新（1.0.0 -> 1.1.0）
npm version minor

# 大版本更新（1.0.0 -> 2.0.0）
npm version major
```

### 发布新版本

```bash
# 1. 修改代码
# 2. 更新 changelog.md
# 3. 提交 Git
git add .
git commit -m "feat: 新增功能"
git push

# 4. 更新版本号
npm version patch

# 5. 发布到 NPM
npm publish

# 6. 同时更新到 DCloud 插件市场
# 在 HBuilderX 中右键 -> 发布到插件市场 -> 更新插件
```

---

## 🔧 NPM 高级配置

### 设置 NPM 镜像源

如果发布速度慢，可以切换镜像源：

```bash
# 查看当前源
npm config get registry

# 切换到官方源（发布时必须使用官方源）
npm config set registry https://registry.npmjs.org/

# 发布后可切回淘宝源（下载加速）
npm config set registry https://registry.npmmirror.com/
```

### .npmignore 文件（已创建）

控制哪些文件不发布到 NPM：

```
example.md
.DS_Store
*.log
node_modules/
.vscode/
.idea/
```

---

## 🎯 用户安装方式

### 通过 NPM 安装

```bash
# 使用 npm
npm install gq-tabbar

# 使用 yarn
yarn add gq-tabbar

# 使用 pnpm
pnpm add gq-tabbar
```

### 通过 DCloud 插件市场安装（推荐）

1. 打开 HBuilderX
2. 搜索 `gq-tabbar`
3. 点击 "使用 HBuilderX 导入插件"

---

## ⚡ 两种方式对比

| 特性 | DCloud 插件市场 | NPM 仓库 |
|------|----------------|----------|
| **安装方式** | HBuilderX 一键导入 | npm install |
| **更新提醒** | ✅ 自动提醒 | ❌ 需手动检查 |
| **收益** | ✅ 支持付费/赞赏 | ❌ 无 |
| **版本管理** | ✅ 可视化管理 | ✅ npm 标准 |
| **用户群体** | uni-app 开发者 | 所有前端开发者 |
| **依赖管理** | uni_modules 自动 | package.json |
| **评价系统** | ✅ 评分+评论 | ❌ 仅下载量 |

---

## 💡 建议

### 推荐策略：双平台发布

1. **主要发布** → DCloud 插件市场
   - 这是 uni-app 开发者的主要来源
   - 可以获得收益

2. **辅助发布** → NPM
   - 方便版本管理
   - 提高可见度
   - 支持更多安装方式

### 发布检查清单

**发布前必检查：**

- [ ] 版本号已更新
- [ ] changelog.md 已更新
- [ ] 代码无错误
- [ ] 已测试主要功能
- [ ] README.md 文档完整
- [ ] Git 已提交（如果有仓库）
- [ ] package.json 信息完整

**DCloud 插件市场额外检查：**

- [ ] 准备 3-5 张效果截图
- [ ] 填写联系方式（QQ）

**NPM 额外检查：**

- [ ] 已登录 NPM（npm login）
- [ ] 使用官方源（npm config get registry）
- [ ] .npmignore 已配置

---

## 🆘 常见问题

### Q: NPM 包名被占用？

修改 `package.json` 中的 `name` 字段，可以使用作用域：

```json
{
  "name": "@yourusername/gq-tabbar"
}
```

### Q: 发布 NPM 失败 403？

1. 确认已登录：`npm whoami`
2. 使用官方源：`npm config set registry https://registry.npmjs.org/`
3. 设置公开访问：`npm publish --access public`

### Q: 版本号冲突？

不能发布已存在的版本号，必须更新版本：

```bash
npm version patch  # 增加修订号
```

### Q: 同时维护两个平台麻烦吗？

不麻烦！代码是同一份：
1. 修改代码
2. 更新 changelog.md
3. `npm version patch && npm publish` （发布到 NPM）
4. HBuilderX 右键发布（更新到插件市场）

---

## 📚 参考资源

- [NPM 官方文档](https://docs.npmjs.com/)
- [DCloud 插件市场](https://ext.dcloud.net.cn/)
- [uni_modules 规范](https://uniapp.dcloud.net.cn/plugin/uni_modules.html)
- [语义化版本](https://semver.org/lang/zh-CN/)

---

**祝发布顺利！🎉**


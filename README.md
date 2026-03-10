# Html2Figma

<p align="center">
  <strong>一键把网页转换为 Figma 设计稿</strong>
</p>

<p align="center">
  Chrome 扩展 · 将当前页面或选中区域导出为 Figma 设计，便于复刻与协作。
</p>

---

## 功能特性

- **整页捕获**：一键将当前标签页的完整页面转为 Figma 画布
- **选区捕获**：在页面上点选任意模块，只把该区域导入 Figma
- **轻量权限**：仅使用 `activeTab` 与 `scripting`，仅在点击扩展时访问当前页
- **本地处理**：页面数据仅在本地与 Figma 之间传递，不上传至第三方服务器

## 安装与使用

### 从 Chrome 网上应用店安装（推荐）

1. 打开 [Chrome 网上应用店](https://chrome.google.com/webstore) 搜索 **Html2Figma**
2. 点击「添加至 Chrome」完成安装
3. 在任意网页点击浏览器工具栏中的扩展图标，选择「捕获全页面」或「选择模块」即可

### 开发者模式安装（本地调试）

1. 克隆本仓库：
   ```bash
   git clone https://github.com/<你的用户名>/hml2figma.git
   cd hml2figma
   ```
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」，点击「加载已解压的扩展程序」
4. 选择本仓库所在目录

> 使用前需在 Figma 中安装并打开配套的 Html2Figma 插件，以便接收来自浏览器的设计数据。

## 项目结构

```
hml2figma/
├── manifest.json      # Chrome 扩展配置（Manifest V3）
├── background.js      # 扩展后台：注入脚本与工具栏
├── toolbar.js         # 页面内工具栏（整页 / 选区模式）
├── capture.js         # 页面 DOM 捕获与转换逻辑（需配合 Figma 插件）
├── icons/             # 扩展图标 16 / 48 / 128
├── docs/
│   ├── privacy.html   # 隐私政策（Chrome 商店要求）
│   └── README.md      # 文档说明
└── README.md
```

## 开发与贡献

- 修改代码后，在 `chrome://extensions/` 中点击该扩展的「重新加载」即可生效
- 欢迎提交 Issue 与 Pull Request：修复 bug、改进交互或补充文档均可

## 隐私与合规

- 本扩展**不收集、不存储、不上传**任何个人或页面数据到自有服务器
- 仅在用户点击扩展时访问当前标签页，用于生成 Figma 设计数据
- 完整说明见 [隐私政策](docs/privacy.html)

## 许可证

本项目采用 [MIT License](LICENSE) 开源。使用与二次开发请遵守许可证条款。

---

<p align="center">
  <sub>若对你有帮助，欢迎 Star ⭐</sub>
</p>

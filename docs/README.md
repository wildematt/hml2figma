# 文档 / Docs

## 隐私政策（Chrome 网上应用店）

`privacy.html` 为本扩展的隐私政策页面，用于满足 Chrome 网上应用店审核要求。

### 如何解决「隐私政策链接无效」被拒

1. **将本页面发布到可公网访问的 URL**
   - 推荐：使用 **GitHub Pages** 发布本仓库（或至少 `docs/` 目录）。
   - 在仓库 Settings → Pages 中，将 Source 设为 `main` 分支的 `/docs` 根目录。
   - 发布后，隐私政策地址一般为：  
     `https://<你的用户名>.github.io/hml2figma/privacy.html`

2. **在 Chrome 网上应用店填写链接**
   - 打开 [Chrome 开发者控制台](https://chrome.google.com/webstore/devconsole)。
   - 进入你的扩展 → 左侧 **Privacy（隐私）**。
   - 在「Privacy policy」一栏填入**直接指向隐私政策页面的 URL**（即上面的 `privacy.html` 的完整地址）。
   - 注意：不能填官网首页或「拥有者网站」，必须填**隐私政策页面本身的链接**。

3. **重新提交审核**
   - 保存后，在 **Package** 中上传新版本或确认当前版本无误，再提交新的草稿供审核。

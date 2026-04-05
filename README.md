# GhostWriter

一个模拟"幽灵作家"概念的 VS Code 代码补全插件。通过 AI 预测代码并以自然打字节奏逐字输出，让代码补全看起来像用户在正常敲代码。

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-1.103.0%2B-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ 功能特点

- 🤖 **AI 代码预测** - 调用 OpenAI 兼容 API 预测用户接下来想写的代码
- ⌨️ **自然打字节奏** - 模拟人类不均匀的打字速度，更加自然隐蔽
- 🔢 **空格合并** - 连续空格一次输出，不逐个空格延迟
- 🔇 **静默运行** - 无弹窗、无状态栏显示，保护隐私
- ⚙️ **高度可定制** - 丰富的配置选项，可调整打字节奏和输出行为
- 🚀 **即时响应** - 按下快捷键即可触发 AI 预测

## 🎯 适用场景

### 代码面试

在技术面试中，当需要在白板编程或限时 coding 挑战中保持竞争力时，GhostWriter 可以帮助你更从容地应对。

### 学习辅助

对于编程学习者，当你对某些语法或 API 不够熟悉时，GhostWriter 可以作为实时代码提示，帮助你理解正确的代码写法。

### 效率提升

在处理重复性较高的代码模式时，AI 预测可以显著减少你的按键次数，提高编码效率。

## 📦 安装说明

### 方法一：从 VSIX 安装

1. 下载 `.vsix` 安装包
2. 在 VS Code 中打开命令面板 (`Cmd/Ctrl + Shift + P`)
3. 输入 `VSIX` 并选择 "Install from VSIX..."

### 方法二：从源码编译安装

```bash
# 克隆项目
git clone https://github.com/rio4raki/ghostwriter.git
cd ghostwriter

# 安装依赖
npm install

# 编译打包
npm run package

# 安装 VSIX（可选）
code --install-extension ghostwriter-*.vsix
```

## 🚀 快速开始

1. 配置 API Key（在设置中输入）
2. 按 `Cmd/Ctrl + Enter` 触发代码预测
3. 继续敲击键盘，AI 预测的代码会逐步"接管"你的输入
4. 按任意键可打断预测

## ⚙️ 配置选项

### 基础配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `API URL` | `https://api.openai.com/v1` | OpenAI 兼容格式的 API Base URL |
| `API Key` | (空) | 你的 API Key |
| `模型名称` | `gpt-3.5-turbo` | 使用的模型 |
| `系统提示词` | 代码补全助手提示 | 自定义 AI 的行为 |
| `最大输出 Token` | 100 | 每次预测的最大输出长度 |

### 输出设置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `单次按键输出字符数` | 1 | 每次按键输出的代码字符数量 |

### 自然节奏设置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `启用自然打字节奏` | true | 模拟人类不均匀的打字速度 |
| `基础打字延迟` | 80ms | 基础延迟时间，数值越小越快 |
| `延迟随机波动范围` | 40ms | 延迟的随机变化范围 |
| `标点符号速度倍率` | 0.5 | 标点符号的延迟倍数（小于1表示更快） |
| `字母间额外随机延迟` | 20ms | 字母间的额外随机延迟上限 |
| `空格键延迟倍率` | 1.5 | 空格的延迟倍数 |
| `换行延迟倍率` | 2.0 | 换行的延迟倍数 |
| `启用空格合并` | true | 连续空格一次输出 |

### 💡 高级调优建议

#### 追求更快的补全速度

```json
{
  "ghostwriter.baseDelay": 50,
  "ghostwriter.variance": 20,
  "ghostwriter.charsPerKey": 2
}
```

#### 追求更自然的打字效果

```json
{
  "ghostwriter.enableNaturalRhythm": true,
  "ghostwriter.baseDelay": 80,
  "ghostwriter.variance": 40,
  "ghostwriter.letterVariance": 20
}
```

#### 面试模式（速度优先）

```json
{
  "ghostwriter.charsPerKey": 3,
  "ghostwriter.enableNaturalRhythm": false
}
```

## 🔧 工作原理

GhostWriter 通过以下方式实现"幽灵"代码补全：

1. **事件拦截**: 监听 VS Code 的键盘输入事件
2. **状态管理**: 维护 READY / TYPING / PREDICTING 等状态
3. **AI 预测**: 调用 OpenAI 兼容 API 获取代码补全建议
4. **智能替换**: 在 TYPING 状态下，将用户输入替换为 AI 预测代码
5. **自然节奏**: 根据配置参数，模拟人类不均匀的打字速度

### 状态说明

- **READY**: 等待用户触发预测
- **TYPING**: 用户正在输入，同时 AI 在后台预测
- **PREDICTING**: AI 正在生成预测结果
- **INSERTING**: 正在插入预测的代码

## ⌨️ 键盘快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Cmd/Ctrl + Enter` | 触发代码预测 | 在编辑器中获得焦点时可用 |
| `任意键` | 打断当前预测 | 可随时中断 AI 输出 |

## 🔒 隐私说明

- **无遥测数据**: 本插件不会收集或发送任何使用数据
- **无弹窗**: 运行过程完全静默，无任何 UI 干扰
- **本地处理**: 所有按键拦截和状态管理均在本地完成
- **API 安全**: API Key 仅用于与 AI 服务通信

## 🐛 问题排查

### 常见问题

**Q: 按下快捷键没有反应？**
- 确保已配置 API Key
- 检查 API URL 是否正确
- 查看 VS Code 输出面板的 GhostWriter 日志

**Q: 预测的代码不准确？**
- 尝试在触发预测前输入更多的代码上下文
- 调整系统提示词以获得更符合预期的结果
- 尝试更换不同的模型

**Q: 打字速度太快/太慢？**
- 调整 `基础打字延迟` 和 `延迟随机波动范围`
- 启用/禁用 `启用自然打字节奏`

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [OpenAI](https://openai.com/) - 提供强大的代码补全 API
- [VS Code](https://code.visualstudio.com/) - 优秀的代码编辑器

## 📮 联系方式

- GitHub Issues: [报告问题](https://github.com/rio4raki/ghostwriter/issues)
- GitHub PRs: [贡献代码](https://github.com/rio4raki/ghostwriter/pulls)

---

**享受 GhostWriter！** ⌨️✨

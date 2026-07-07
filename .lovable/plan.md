## 目标
在聊天页面添加语音输入功能，方便不便打字的老人使用。用户说话 → 自动转文字 → 填入输入框 → 发送给 AI；AI 回复保持文字形式（不变）。

## 建议方案

**语音转文字使用 Lovable AI 网关**（`openai/gpt-4o-mini-transcribe` 模型），无需额外配置 API key，与现有聊天函数使用同一 `LOVABLE_API_KEY`，支持中英文自动识别。

## 交互设计（面向老人优化）

在 `src/components/ChatPage.tsx` 输入框左侧（图片上传按钮旁）新增一个**大号麦克风按钮**：

- 未录音：显示灰色麦克风图标，提示"按住说话"或"点击开始录音"
- 录音中：按钮变红 + 脉冲动画 + 显示"正在聆听…"提示条
- 录音结束：显示"正在识别…" loading 状态
- 识别完成：自动把文字填入输入框，老人可确认后点发送（避免误识别直接发出）
- 出错：Toast 提示"没听清，请再试一次"

交互模式建议**点击切换**（点击开始 / 再次点击结束），比按住说话对老人更友好，也兼容触屏和鼠标。可加 60 秒自动停止防止忘记关闭。

## 技术实现

**前端**（`src/components/ChatPage.tsx` + 新增 `VoiceInputButton.tsx`）：
- 用 Web Audio API 采集 PCM，停止时编码成 WAV（16kHz 单声道）— 遵循 `ai-speech-to-text` 知识文件，避免 Safari MP4 / MediaRecorder 分片问题
- 检查麦克风权限；被拒绝时提示引导
- 录音时长 < 1秒 或空白时提示重录，不发请求
- 上传 WAV 到新 edge function

**后端**（新增 `supabase/functions/transcribe-audio/index.ts`）：
- 接收 `multipart/form-data` 的 WAV 文件
- 转发到 `https://ai.gateway.lovable.dev/v1/audio/transcriptions`
- Header: `Authorization: Bearer ${LOVABLE_API_KEY}`
- Body: `file` + `model=openai/gpt-4o-mini-transcribe`
- 返回 `{ text }` 给前端
- 完整错误处理（429 额度不足、403 未启用等）

**config.toml**：新函数 `verify_jwt = true`（保护接口）

## UI 无障碍要点
- 麦克风按钮尺寸 ≥ 52×52px（和现有发送按钮一致）
- 明显的 aria-label：`"语音输入"` / `"停止录音"`
- 录音状态用颜色 + 文字 + 图标三重反馈（不仅靠颜色）
- 识别结果填入后光标定位到末尾，方便老人补充或直接发送

## 不改动的部分
- AI 回复渲染逻辑不变，仍为文字
- `gut-health-chat` 函数不变
- 聊天历史存储不变

## 后续可选增强（本次不做，等确认再加）
- 朗读 AI 回复（TTS，让老人也能"听"回答）
- 识别后自动发送（跳过确认步骤）
- 支持方言 / 指定语言
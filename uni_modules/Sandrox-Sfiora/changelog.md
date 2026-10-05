# Changelog

各渠道的可用版本以对应发布页面为准，离线文件见 [GitHub Releases](https://github.com/sandroxy/sfiora/releases)。

## 1.2.0（2026-09-17）
- 新增可选 Android 前台标签接管，避免应用空闲时因贴近标签而打开其他标签处理页面。按页面申请和释放，支持多个持有者及前后台、NFC 开关变化；默认关闭，不自动启动读写。
- 新增 Android 操作面板状态查询与结束等待，便于完整展示操作反馈后再跳转。等待只包含调用时已经显示的面板，后续面板不延长等待；超时返回 `PRESENTATION_TIMEOUT`，不取消读写或强制关闭面板。
- RN 两种架构、经典 uni-app 的 legacy / UTS 和 uni-app x 均提供上述桥接接口。iOS 可查询平台能力，但不支持 Android 前台接管或系统面板关闭时间的等待。
- 在同一 Android 控制器上开始下一次操作时立即关闭上一次的面板，避免旧面板在页面退出后仍等待动画结束。
- 修复 Android UTS 宿主因语言或配置变化重建后，前台标签接管可能停留在暂停状态的问题；桥接按当前 Activity 的真实生命周期恢复和清理。
- Android UTS 读写和初始化仅在宿主处于前台时启动；旧 Activity 的迟到调用不会重新接管绑定或取消新宿主的读写，后台状态查询和清理仍可执行。

接入与生命周期示例见 [Android 指南](https://github.com/sandroxy/sfiora/blob/main/native/android/README.md)、[RN 指南](https://github.com/sandroxy/sfiora/blob/main/adapters/react-native/README.md) 和 [UNI 指南](https://github.com/sandroxy/sfiora/blob/main/adapters/uniapp/README.md)。
## 1.1.0 - 2026-09-14

- 修复 RN Android 在后台启动或 Activity 生命周期变化时的会话竞争，关闭完成前仍能正确查询忙碌状态。
- 修复 iOS 自动读取中旧会话的迟到回调影响当前操作的问题。
- 改善 Android 取消、超时和移开标签后的资源清理，等待 I/O 退出及最终关闭后释放占用。
- 加固 Android 深度读取的标签技术切换；切换期间取消或关闭失败时停止后续探测。
- Android 读取与初始化判断仅使用实时 NDEF 消息，空消息不再回退到发现时缓存。
- 会话关闭耗时异常时，在有限等待后返回待处理结果；实际资源释放前仍保持忙碌，不自动重放写入。
- RN 与 UNI 各接入方式新增 `waitForIdle()`，默认最多等待 5 秒，可配置等待期限；查询失败或超时均返回错误，不视为空闲。
- Android 操作面板在成功时结束读取动画，完整展示打勾后再收起，修正动画重叠和连续操作时成功提示过早消失的问题；原生、RN 和 UNI 共用此行为。
- 补充关闭迟延、取消重启、旧回调、标签技术切换和写后移开标签的回归测试，并交叉验证 Android NDEF 编解码。

## 1.0.0

- 提供 Android 与 iOS 原生 NFC 核心，以及 React Native、经典 uni-app legacy / UTS 和 uni-app x Vapor 的 Android/iOS 接入。
- 提供单次前台标签发现、NDEF 读取、原始字节与常见记录解析，以及设备 NFC 能力查询。
- 支持 Text、URI、MIME 和 External Type 记录组成的完整 NDEF 消息写入，成功前回读并验证完整消息字节。
- 提供按 External Type 标记保留或初始化：匹配标记时保留原内容，没有标记时替换并验证新消息。
- 提供进程内读写互斥、取消、超时、会话状态和结构化错误。
- 提供可选 Android 原生操作面板、RN / UNI 的 Android 操作面板与 iOS 系统 NFC 会话集成。
- React Native 支持旧架构和 TurboModules，并提供 Expo 配置插件。

写入仅面向已支持 NDEF 的可写标签，不提供格式化、物理防改写、密码修改或身份认证。写入中断或验证失败不保证旧内容保留；保留/初始化的标记属于应用约定。完整接入方式和边界见各平台使用说明。

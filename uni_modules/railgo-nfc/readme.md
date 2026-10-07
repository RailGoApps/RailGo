# railgo-nfc

uni-app UTS 原生插件：读写 NFC NTAG213 / NTAG215 / NTAG216 标签（NDEF URI / Text / AAR 记录），支持通过 NFC 标签调起 App。目标平台：**Android、iOS、HarmonyOS**。

> **当前版本状态**：仅 Android 为完整实现；**iOS / HarmonyOS 为空壳占位**（保留同名导出函数保证三端打包可解析，所有 API 返回 `10014 平台不支持`，不引用 CoreNFC/@kit、不含 entitlement 与权限声明，不参与签名配置）。历史完整实现见本插件早期版本，启用时替换 `app-ios/index.uts`、`app-harmony/index.uts` 并恢复各自 config 文件即可。

## 目录结构

```
uni_modules/railgo-nfc/
├── package.json
├── readme.md
└── utssdk/
    ├── interface.uts            # 跨端类型、错误码、NDEF/T2T 纯逻辑（三端共用编解码）
    ├── app-android/
    │   ├── index.uts            # 对外 API 入口（NfcAdapter 前台分发 + T2T 逐页读写）
    │   ├── tag-core.uts         # 标签解析（共享 UTS 函数）
    │   ├── NfcTagReceiver.kt    # 前台扫描接收器 + Tag 队列（包名 com.railgo.nfc）。
    │   │                        # ⚠️ uni-app 云打包把插件所有 .uts 合并成单个 index.kt，
    │   │                        # .uts 二级文件里的 class 会被静默丢弃 → manifest 组件类必须用 .kt 混编
    │   ├── config.json          # minSdkVersion 21
    │   └── AndroidManifest.xml  # NFC 权限 + PandoraEntry.Activity alias + com.railgo.nfc.NfcTagReceiver（无 intent-filter）
    ├── app-ios/
    │   ├── index.uts            # CoreNFC NFCNDEFReaderSession
    │   ├── config.json          # frameworks: CoreNFC, target 13
    │   ├── Info.plist           # NFCReaderUsageDescription
    │   └── UTS.entitlements     # com.apple.developer.nfc.readersession.formats = [NDEF, TAG]
    └── app-harmony/
        ├── index.uts            # @kit.ConnectivityKit tag/nfcController
        ├── config.json
        └── module.json5         # ohos.permission.NFC_TAG
```

## API（三端同名同签名）

| 方法 | 说明 |
|---|---|
| `checkStatus(): NfcStatusInfo` | `{supported, enabled}` 是否支持 NFC / 是否已开启 |
| `initNfc(options?): NfcStatusInfo` | 仅返回 NFC 状态；**options 回调已全部停用**（见下方 ⚠️），请轮询消费发现事件 |
| `startScan(options?): boolean` | 开始扫描（App 前台有效）；options 回调不再生效 |
| `stopScan(): void` | 停止扫描 |
| `isScanning(): boolean` | 扫描状态 |
| `onTagDiscovered(cb)` / `offTagDiscovered()` | ⚠️ 空实现（已停用） |
| `onError(cb)` / `offError()` | ⚠️ 空实现（已停用） |
| `onScanStopped(cb)` / `offScanStopped()` | ⚠️ 空实现（已停用） |
| `hasStartupTag(): boolean` | 队列中是否有已发现的标签（**轮询判据**，boolean 跨桥可靠） |
| `takeStartupTag(): NfcTagInfo \| null` | 消费接收器收到的标签；**轻量解析**（仅 uid/techList，不建 RF 会话，保持 Tag 可写）；须先判 `hasStartupTag()`，并对 `t.uid` 二次校验 |
| `getLastTag(): NfcTagInfo \| null` | 最近一次发现的标签 |
| `writeNdef(records, options?)` | 写多条记录；`options.formatBlank` 默认 true。`success/fail` 在本次调用栈内同步触发，**安全可用** |
| `writeUri(uri, options?)` | 只写一条 URI 记录的便捷方法 |
| `uriRecord(uri)` / `textRecord(text, lang)` / `aarRecord(pkg)` | 构造 `NdefRecordSpec` |
| `processHarmonyWant(want)`（仅鸿蒙） | 宿主把 TAG_FOUND want 转发给插件解析 |

> ⚠️ **UTS 回调生命周期（keepalive）**：JS 回调在本次调用结束后即被框架释放，插件若存储后在后续调用中执行会报「回调函数已释放，不能再次执行」并崩溃。
> 因此本插件 Android 端**不存储、不执行任何跨调用回调**（onTagDiscovered/onError/onScanStopped 均为空实现，仅保留签名兼容）；
> 错误经 `console.error` + `writeNdef` 的 `fail`（同调用栈）传递；发现事件走队列，由 `hasStartupTag()/takeStartupTag()` 轮询消费。

`NfcTagInfo`：`uid`（hex，iOS 为空串）、`techList`、`tagType`（NTAG213/215/216…）、`userBytes`、`maxNdefSize`、`formatted`、`writable`、`records`（`NdefRecordData[] | null`，null=空白标签）。

`NdefRecordData`：`tnf`、`recordType`（`URI/TEXT/AAR/MIME/EXTERNAL/UNKNOWN/…`）、`uri`、`text`、`language`、`packageName`、`id`、`payloadHex`。三端使用 `interface.uts` 同一套纯逻辑解码，输出完全一致。

## 错误码

| 码 | 含义 | | 码 | 含义 |
|---|---|---|---|---|
| 10001 | 设备不支持 NFC | | 10009 | 空间不足 |
| 10002 | NFC 未开启 | | 10010 | 写入失败 |
| 10003 | 尚无标签 | | 10011 | 读取失败 |
| 10004 | 标签已离开 | | 10012 | 扫描已在进行 |
| 10005 | 不支持 NDEF 技术 | | 10013 | 参数不合法 |
| 10006 | 空白标签未格式化(iOS) | | 10014 | 平台不支持 |
| 10007 | 格式化失败 | | 10015 | iOS 会话超时 |
| 10008 | 标签只读/锁定 | | | |

## 使用示例（Vue3 / uvue 同理）

```js
import * as nfc from '@/uni_modules/railgo-nfc'

const status = nfc.checkStatus()
if (!status.supported) { /* 提示不支持 */ }
if (!status.enabled) { /* 引导去系统设置开启 NFC */ }

nfc.startScan(null)

// 发现事件：轮询消费（不要用 onTagDiscovered/onError 回调，插件已停用跨调用回调）
setInterval(() => {
  if (!nfc.hasStartupTag()) return
  const t = nfc.takeStartupTag()
  if (t != null && t.uid != null) {
    console.log('UID:', t.uid, t.tagType)
    ;(t.records ?? []).forEach(r => console.log(r.recordType, r.uri ?? r.text ?? r.packageName))
  }
}, 250)

// 写：URI + AAR（Android 优先用 AAR 调起 App）
// success/fail 在本次调用栈内同步触发，可安全使用
nfc.writeNdef([
  nfc.uriRecord('myapp://product/detail?pid=10086'),
  nfc.aarRecord('com.example.myapp')
], {
  success: (tag) => uni.showToast({ title: '写入成功' }),
  fail: (code, msg) => uni.showToast({ title: `失败 ${code}`, icon: 'none' })
})

// 调起场景：railgo:// scheme 深链走 App.vue onShow 的 plus.runtime.arguments 路由（不经插件队列）
```

## NFC 标签调起 App

### Android
1. **AAR**：写入 `aarRecord(包名)`（组件端写标签时自动附带，包名来自 `getPackageName()`）。标签含 AAR 时系统把调起限定到该包 → **贴标直跳 App，不弹"选择应用"**（未安装则无动作）。前提：亮屏（非锁屏界面）+ NFC 开启。
2. **URI 调起链路（当前架构）**：标签 URI 记录 `railgo://页面路径?参数` 由插件 AndroidManifest 中 **`io.dcloud.PandoraEntry.Activity` activity-alias 上的 `NDEF_DISCOVERED`（scheme=railgo）过滤器**接收。⚠️ manifest.json 的 `schemes` 只生成 VIEW+BROWSABLE 过滤器，Android 后台标签分发（NDEF→TECH→TAG→AAR）不匹配 VIEW——缺 NDEF_DISCOVERED 过滤器时只会靠 AAR 兜底"裸启动"进主页，页面参数丢失。alias 本体也必须存在（缺失 IllegalStateException 崩溃）。深链路由在 App.vue onShow 的 `plus.runtime.arguments` 解析中完成。
3. **前台扫描**：`enableForegroundDispatch` 的 `PendingIntent.getBroadcast` 指向 `com.railgo.nfc.NfcTagReceiver`（.kt 混编类，`exported=false`、无 NFC intent-filter）。接收器只把原始 Tag 入静态队列；`takeStartupTag()` 出队并在 JS 调用栈内解析。
4. 注意：Android 16+ 含 http/https URI 的标签改走 `ACTION_VIEW`，Android 17+ 需用户点"打开链接"通知（系统策略，自定义 scheme + AAR 不受影响）。
5. 组件类包名为 `com.railgo.nfc`（.kt 文件声明），不走 `uts.sdk.modules.railgoNfc`——该包由 UTS 合并编译生成，手写组件类放 .uts 会被丢弃。

### iOS
- CoreNFC 无后台标签调起读标签能力（系统仅支持 NDEF 文本类 URI 弹通知）。调起依赖标签首条 URI 记录：自定义 scheme（`myapp://`）或 Universal Link。
- 必须：Apple Developer 后台为 App ID 开启 **NFC Tag Reading** 能力，签名 Profile 包含 `com.apple.developer.nfc.readersession.formats`（插件 UTS.entitlements 已声明，云打包会合并）。

### HarmonyOS
- 插件已声明 `ohos.permission.NFC_TAG`。
- 标签调起：在**宿主工程** `src/main/module.json5` 的 EntryAbility `skills` 中添加：
  ```json5
  "skills": [
    {
      "actions": ["ohos.nfc.tag.action.TAG_FOUND"],
      "uris": [
        { "scheme": "file" }  // 同时可加你的自定义 scheme 供 URI 调起
      ]
    }
  ]
  ```
  并在 EntryAbility `onCreate/onNewWant` 中拿到 want 后转发：
  ```ts
  import * as nfc from '../../../../../uni_modules/railgo-nfc/utssdk/app-harmony/index.uts'
  const info = nfc.processHarmonyWant(want)   // 得到 NfcTagInfo
  ```
  标签内 URI 记录也会直接以 `want.uri` 传入，可用于路由跳转。
- UTS 插件编译为 HAR，**无法自带 skills 拉起配置**，上述宿主配置为必需。

## NTAG / T2T 写入说明（需求 6）

- 首选路径：`Ndef.writeNdefMessage`（已格式化标签）→ `NdefFormatable.format`（空白标签）→ **T2T 逐页写兜底**：
  - 页大小 4 字节；页 0–3 厂商区，**页 2 为 CC**（能力容器）：空白时写 `[0xE1, 0x10, userBytes/8, 0x00]`。
  - 用户区从页 4 起：NTAG213 页 4–39（144B）、215 页 4–129（504B）、216 页 4–225（888B），型号由 `GET_VERSION(0x60)` 响应第 7 字节判定（0x0F/0x11/0x13）。
  - TLV 框架：`0x03 [len] <NDEF消息> 0xFE`；len<0xFE 用短格式，`0xFE` 后跟 2 字节长度、`0xFF` 后跟 3 字节长度。
  - **RFUI**：末条记录之后、页对齐补位为 RFUI 保留位，本插件统一写 `0x00`，避免误覆盖 Lock/OTP/Cfg 页（配置页 213:0x28–0x2C、215:0x82–0x86、216:0xE2–0xE6 均不在写入范围内）。
- URI 前缀缩写表与 Android `NdefRecord` 一致（RTD_URI 1.0，36 项）；自定义 scheme（`myapp://`）前缀码为 `0x00` 不压缩。

## 平台差异一览（需求 8）

| 能力 | Android | iOS | HarmonyOS |
|---|---|---|---|
| 扫描（前台） | ✅ 透明 Activity 分发 | ✅ 每次手势触发、单贴会话 | ✅ registerForegroundDispatch |
| 读 UID | ✅ | ❌ 空串 | ✅ |
| 读 NDEF | ✅ | ✅ | ✅ |
| 写 URI/Text | ✅ | ✅ | ✅ |
| 写 AAR | ✅（可调起） | ⚠️ 可写入但 iOS 不消费 | ✅（写入供安卓调起） |
| 空白标签格式化 | ✅ NdefFormatable | ❌ **10006** | ✅ |
| T2T 逐页读写 | ✅ | ❌ 无原始命令通道 | ✅ transceive |
| 标签冷启动调起 | ✅ | ⚠️ 仅 URI 通知 | ✅（需宿主 skills） |
| 熄屏/后台读 | ✅ 系统分发 | ❌ | ✅ 系统分发 |

## 构建与验证清单（务必真机）

1. HBuilderX ≥ 4.x；**Android 修改 manifest/res 后需重做自定义调试基座**，iOS 需云端打包（本地 iOS 调试不支持）。
2. UTS 对 Swift/Kotlin 互操作语法随版本演进，三端首次编译如遇报错，按注释定位调整（重点：Android `ByteArray` 互转 `kb2n/n2kb`；iOS delegate 方法签名与带标签参数调用；鸿蒙 `registerForegroundDispatch` 回调签名）。
3. 功能自测顺序：`checkStatus` → `startScan` 贴已格式化 NTAG215 → 校验 records → `writeUri` → `writeNdef(uri+aar)` → 空白标签格式化写入 → 熄屏贴标调起 → `takeStartupTag`。

## 参考

- UTS 插件规范：https://uniapp.dcloud.net.cn/plugin/uts-plugin.html
- Android NFC：https://developer.android.com/guide/topics/connectivity/nfc
- Core NFC：https://developer.apple.com/documentation/corenfc
- HarmonyOS NFC 标签：https://developer.huawei.com/consumer/cn/doc/doccenter-references/api/js-apis-nfctag
- NTAG213/215/216 数据手册（T2T 页结构/RFUI）：https://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf

# railgo-nfc

uni-app UTS 原生插件：读写 NFC NTAG213 / NTAG215 / NTAG216 标签（NDEF URI / Text / AAR 记录），支持通过 NFC 标签调起 App。目标平台：**Android、iOS、HarmonyOS**。

## 目录结构

```
uni_modules/railgo-nfc/
├── package.json
├── readme.md
└── utssdk/
    ├── interface.uts            # 跨端类型、错误码、NDEF/T2T 纯逻辑（三端共用编解码）
    ├── app-android/
    │   ├── index.uts            # NfcAdapter 前台分发 + 透明分发 Activity + T2T 逐页读写
    │   ├── config.json          # minSdkVersion 21
    │   ├── AndroidManifest.xml  # NFC 权限 + NfcDispatchActivity intent-filter
    │   └── res/xml/railgo_nfc_tech_filter.xml
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
| `initNfc(options?): NfcStatusInfo` | 注册事件回调，并把冷启动队列里的标签补发给 `onTagDiscovered` |
| `startScan(options?): boolean` | 开始扫描（App 前台有效） |
| `stopScan(): void` | 停止扫描，触发 `onScanStopped` |
| `isScanning(): boolean` | 扫描状态 |
| `onTagDiscovered(cb)` / `offTagDiscovered()` | 发现标签回调（`NfcTagInfo`，含已解析 records） |
| `onError(cb)` / `offError()` | `(code, message)` 统一错误 |
| `onScanStopped(cb)` / `offScanStopped()` | 扫描停止 `(reason)` |
| `takeStartupTag(): NfcTagInfo \| null` | 消费冷启动/离屏时读到的标签（调起场景） |
| `getLastTag(): NfcTagInfo \| null` | 最近一次发现的标签 |
| `writeNdef(records, options?)` | 写多条记录；`options.formatBlank` 默认 true |
| `writeUri(uri, options?)` | 只写一条 URI 记录的便捷方法 |
| `uriRecord(uri)` / `textRecord(text, lang)` / `aarRecord(pkg)` | 构造 `NdefRecordSpec` |
| `processHarmonyWant(want)`（仅鸿蒙） | 宿主把 TAG_FOUND want 转发给插件解析 |

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

const status = nfc.initNfc({
  onTagDiscovered: (tag) => {
    console.log('UID:', tag.uid, tag.tagType)
    tag.records?.forEach(r => console.log(r.recordType, r.uri ?? r.text ?? r.packageName))
  },
  onError: (code, msg) => uni.showToast({ title: `${code} ${msg}`, icon: 'none' }),
  onScanStopped: (reason) => console.log('scan stopped:', reason)
})
if (!status.supported) { /* 提示不支持 */ }
if (!status.enabled) { /* 引导去系统设置开启 NFC */ }

nfc.startScan()

// 写：URI + AAR（Android 优先用 AAR 调起 App）
nfc.writeNdef([
  nfc.uriRecord('myapp://product/detail?pid=10086'),
  nfc.aarRecord('com.example.myapp')
], {
  success: (tag) => uni.showToast({ title: '写入成功' }),
  fail: (code, msg) => uni.showToast({ title: `失败 ${code}`, icon: 'none' })
})

// 冷启动调起：App.vue onLaunch/onShow 中
const startup = nfc.takeStartupTag()   // Android 有效；iOS 恒为 null
```

## NFC 标签调起 App

### Android
1. **AAR**：写入 `aarRecord(包名)`。贴标时若安装了该包名 App 则直接调起（系统行为，Android 8 起 AAR 仅决定"启动哪个 App"，数据仍走 NDEF/TECH 分发）。
2. **URI（NDEF_DISCOVERED）**：写 `myapp://...` 记录，贴标冷启动 App。插件 `AndroidManifest.xml` 已为 `NfcDispatchActivity` 声明 `NDEF_DISCOVERED`（scheme=`myapp`，**请改成你的 scheme**，可加 `https` 域名项）、`TECH_DISCOVERED`（tech-list=NTAG 相关）与 `TAG_DISCOVERED`。标签 Intent 由插件透明 Activity 解析入队，JS 端用 `takeStartupTag()`/`initNfc` 消费——**无需改动宿主 manifest 的 Activity**。
3. 注意：Android 16+ 含 http/https URI 的标签改走 `ACTION_VIEW`，Android 17+ 需用户点"打开链接"通知（系统策略，自定义 scheme 不受影响）。
4. `NfcDispatchActivity` 类名对应插件编译包名 `uts.sdk.modules.railgoNfc`（插件 id `railgo-nfc` 驼峰化）。

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

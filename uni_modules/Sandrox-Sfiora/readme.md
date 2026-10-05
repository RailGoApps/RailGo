# Sfiora 通用 NFC 读写

Sfiora 为经典 uni-app 和 uni-app x 的 Android/iOS App 提供 NFC 标签读取、NDEF 消息写入与回读验证，以及按标记保留或初始化。读写内容由应用决定，可使用文本、URI、MIME 或 NFC Forum External Type 记录。

## 兼容范围

| 接入方式 | 页面与运行环境 | 最低系统 |
| --- | --- | --- |
| 经典 uni-app UTS | Vue 2 / Vue 3 的 App Vue 页面，uni_modules | Android API 21 / iOS 13 |
| uni-app x | Vapor，uni_modules | Android API 23 / iOS 15 |
| 经典 uni-app legacy | Vue 2 / Vue 3 的 App Vue 页面，原生插件 | Android API 21 / iOS 13 |

使用 HBuilderX 5.24 或更新版本，并满足所用 HBuilderX、宿主框架和打包工具的系统要求。UTS 市场兼容表对 classic/x 使用共同最低声明 Android API 23 / iOS 15；经典 uni-app 的插件原生配置最低为 API 21 / iOS 13。

NFC 操作需要支持 NFC 的真机。本文的 uni-app x 接入说明面向 Vapor。不支持 H5、小程序、nvue 或 HarmonyOS，也不能仅靠标准基座或热更新添加原生 NFC 能力。

各渠道已上架的版本以渠道页面为准；离线包和版本历史见 [GitHub Releases](https://github.com/sandroxy/sfiora/releases)。同一个 App 只安装一种 Sfiora 插件形态。

## 安装与导入

### UTS：经典 uni-app 与 uni-app x

从 [DCloud 插件市场](https://ext.dcloud.net.cn/plugin?name=Sandrox-Sfiora) 导入 `Sandrox-Sfiora`，或者从 [GitHub Releases](https://github.com/sandroxy/sfiora/releases) 下载 `sfiora-uniapp-<version>.zip`。将 ZIP 内的文件解压到 `uni_modules/Sandrox-Sfiora`，确认 `package.json` 直接位于该目录中，避免再嵌套一层同名目录。

`<version>` 替换为所选发行版本。从 1.1.0 起，无后缀的 UNI ZIP 是经典 uni-app 与 uni-app x 共用的 UTS 包，带 `-legacy` 的 ZIP 是经典原生插件。历史 1.0.0 的 UTS 文件名为 `sfiora-uniapp-uts-1.0.0.zip`，无后缀文件为 legacy；安装历史版本时按该 Release 的说明选择。

两种宿主都使用下面的公共 JavaScript SDK：

```js
import * as sfiora from '@/uni_modules/Sandrox-Sfiora/js_sdk/index.js';
```

它提供 Promise 返回值和带字符串错误码的 `SfioraError`。经典 uni-app 和 x Vapor 使用此入口即可，无须自行处理原生回调或 JSON。

需要在 UTS 代码中直接调用原生接口时，也可使用模块根入口：

```uts
import * as sfiora from '@/uni_modules/Sandrox-Sfiora'
```

直接 UTS 方法返回 `Promise<UTSJSONObject>`、`Promise<boolean>` 或 `Promise<void>`；拒绝值保留 `code`、`message`、`recoverable`、`nativeError`，应按字段处理，不依赖 `instanceof Error`。直接 UTS 导入不改变上表的宿主兼容范围，下文的 uni-app x 页面示例仍使用 Vapor。

### Legacy：经典 uni-app 原生插件

从 [GitHub Releases](https://github.com/sandroxy/sfiora/releases) 下载 `sfiora-uniapp-legacy-<version>.zip`，将其中的 `Sandrox-Sfiora` 目录放入项目的 `nativeplugins`，然后在 `manifest.json` 的 App 原生插件配置中选择这个本地插件。

```js
import * as sfiora from '@/nativeplugins/Sandrox-Sfiora/js_sdk/index.js';
```

下面经典 uni-app 示例只需替换这一行导入，API 与 UTS 版本一致。原生模块名是 `Sfiora`，但业务代码使用公共 SDK，不需要直接调用 `uni.requireNativePlugin`。

## 权限、签名与自定义基座

### Android

Android 插件声明 `android.permission.NFC`，并将 NFC 硬件声明为可选，因此无 NFC 的设备也可以安装应用。NFC 没有运行时权限弹框；使用前通过 `getCapabilities()` 检查设备支持和系统 NFC 开关。

### iOS

iOS 应用需要 NFC 用途说明、`TAG` entitlement，以及包含 **Near Field Communication Tag Reading** 能力的 App ID 和签名描述文件。用途说明应描述实际应用用途。

经典 uni-app 在 `manifest.json` 中合并以下配置，保留已有的其他权限：

```json
{
  "app-plus": {
    "distribute": {
      "ios": {
        "privacyDescription": {
          "NFCReaderUsageDescription": "读取和写入您选择的 NFC 标签。"
        },
        "capabilities": {
          "entitlements": {
            "com.apple.developer.nfc.readersession.formats": ["TAG"]
          }
        }
      }
    }
  }
}
```

uni-app x 在项目根目录的 `Info.plist` 中添加用途说明：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NFCReaderUsageDescription</key>
    <string>读取和写入您选择的 NFC 标签。</string>
</dict>
</plist>
```

在 `nativeResources/ios/UniApp.entitlements` 中添加：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.nfc.readersession.formats</key>
    <array>
        <string>TAG</string>
    </array>
</dict>
</plist>
```

已有这两个文件时合并键值，不要覆盖其他插件的配置。原生资源目录规则见 [DCloud iOS 原生配置](https://doc.dcloud.net.cn/uni-app-x/collocation/app-nativeresource-ios.html)。使用 FeliCa 轮询时，还需在 `Info.plist` 的 `com.apple.developer.nfc.readersession.felica.systemcodes` 中填写应用支持的真实系统码；ISO 7816 AID 配置也由宿主按目标标签提供。

### 构建与运行

安装插件、修改原生权限或升级插件后，制作包含当前插件的自定义基座，或重新打包完整 App，再选择该基座运行到真机。基座需要匹配 HBuilderX、平台和插件版本。只修改页面布局或调用参数时，可以在同一匹配基座上重新运行页面；原生模块、权限和签名变化需要重新打包。

## 接口一览

所有方法均返回 Promise。参数、结果和错误的完整类型见包内 `js_sdk/index.d.ts`；直接 UTS 入口使用对应的 UTS 类型。下文分别给出各操作的调用示例。

| 方法 | 用途 |
| --- | --- |
| `getCapabilities` | 查询设备 NFC 支持和启用状态 |
| `startScan` | 读取一次标签快照 |
| `writeNdef` | 替换并验证完整 NDEF 消息 |
| `initializeNdef` | 保留匹配内容，或写入并验证初始化消息 |
| `cancelScan` | 请求取消当前读取 |
| `cancelWrite` | 请求取消当前写入或初始化 |
| `isScanning` | 查询原生读取是否仍在进行 |
| `isWriting` | 查询原生写入是否仍在进行 |
| `waitForIdle` | 在期限内等待本桥接实例空闲 |
| `acquireForegroundDispatch` / `releaseForegroundDispatch` | 按 owner 申请／释放 Android 前台接管 |
| `getForegroundDispatchState` | 查询前台接管的原生状态及诊断 |
| `getPresentationState` | 查询插件当前显示的 Android 面板；iOS 标明不支持 |
| `waitForPresentationEnd` | 在期限内等待已显示的 Android 面板结束；iOS 返回不支持 |

## 开始读取

先由用户启动操作，再靠近标签；读写期间保持应用前台并稳定贴住标签。每次 `startScan` 只完成一次读取，不是持续事件订阅。

下面经典 uni-app 示例是业务 JS 模块中的辅助函数，由页面的点击事件调用。页面负责展示结果、处理 Promise 失败，并按[生命周期说明](#取消页面生命周期与按钮状态)管理按钮和取消操作：

```js
import * as sfiora from '@/uni_modules/Sandrox-Sfiora/js_sdk/index.js';

export async function readTag() {
  const capability = await sfiora.getCapabilities();
  if (!capability.supported || !capability.enabled) {
    throw new Error('当前设备不支持 NFC，或 NFC 尚未开启。');
  }
  try {
    return await sfiora.startScan({ mode: 'automatic', timeoutMilliseconds: 30000 });
  } catch (error) {
    if (error instanceof sfiora.SfioraError && error.code === 'USER_CANCELLED') {
      return null;
    }
    throw error;
  }
}
```

uni-app x Vapor 的 `.uvue` 页面可使用下面的 UTS 方法。调用方将返回值绑定到自己的页面，并处理失败结果：

```uts
import * as sfiora from '@/uni_modules/Sandrox-Sfiora/js_sdk/index.js'

async function readTag(): Promise<UTSJSONObject> {
  const capability: UTSJSONObject = await sfiora.getCapabilities()
  const supported = capability['supported'] as boolean | null
  const enabled = capability['enabled'] as boolean | null
  if (supported != true || enabled != true) {
    throw new Error('当前设备不支持 NFC，或 NFC 尚未开启。')
  }
  return await sfiora.startScan({ mode: 'automatic', timeoutMilliseconds: 30000 })
}
```

三种读取模式：

| `mode` | 行为 |
| --- | --- |
| `automatic` | 默认模式；发现标签，并在可用时读取 NDEF |
| `ndef` | 要求 NDEF；iOS 使用系统 NDEF 兼容读取会话，结果可能没有标签 ID |
| `discover` | 只获取标签信息，不主动读取 NDEF |

结果包含 `id`、`technologies`、`warnings` 和可选的 `ndef`。先检查 `tag.ndef` 是否存在，再从其 `records` 中读取文本 `text`、URI `uri` 或二进制内容 `payloadBase64`。经典 uni-app 可用可选链访问；UTS 使用 `UTSJSONObject` 的访问方法或明确的类型转换。

发现标签成功并不代表 NDEF 读取成功，需检查 `ndef.status`、`ndef.readError` 和 `warnings`。无值或读取错误不能被当成业务上的“空标签”。两端可读的技术信息和 ID 可能不同；没有标识时仍有 `id` 对象，但 `hex`、`base64` 为空字符串，`length` 为 0。

Android 的读取和初始化判断均使用实时 NDEF 内容，当前空消息不回退到发现时缓存。

## 替换 NDEF 消息并验证

下面的方法沿用前面的 `sfiora` 导入，从用户点击事件调用，并在调用处处理 Promise 失败：

```js
export async function replaceTag() {
  return await sfiora.writeNdef({
    records: [{ kind: 'text', text: 'Hello from Sfiora', languageCode: 'en' }],
  }, { timeoutMilliseconds: 30000 });
}
```

这是**替换整条 NDEF 消息**，旧记录会被覆盖。标签必须已经支持 NDEF、可写且容量足够。成功结果包含 `verified: true`、`bytesWritten`、`recordCount` 和回读的 `tag`；验证比较完整 NDEF 消息的序列化字节。

写入没有事务回滚保证。写入开始后失去接触、取消或验证失败，标签可能保留旧内容，也可能变成新内容、部分内容或空内容。失败后重新读取，才能判断标签实际状态；不能把“报错”理解成“原内容一定没变”。

### NDEF 记录格式

`records` 必须非空，可包含多条记录。下面四种记录既可单独使用，也可组合成一条消息：

```js
const records = [
  { kind: 'text', text: '你好', languageCode: 'zh-Hans', encoding: 'UTF-8' },
  { kind: 'uri', uri: 'https://example.com' },
  { kind: 'mime', mediaType: 'application/octet-stream', payloadBase64: 'AQID' },
  { kind: 'external', domain: 'example.com', type: 'initialized', payloadBase64: 'AQID' },
];
```

Text 需要 `languageCode`，默认 UTF-8，也支持 UTF-16。语言码属于 NDEF 格式，不是正文；某些工具的原始值会把语言码和正文一起显示，业务应读取解析后的 `text`。网址建议使用带 `https://` 等协议的 URI 记录。

MIME 和 External Type 的 `payloadBase64` 表达原始字节。例如 `AQID` 写入三个字节 `01 02 03`，不是写入四个字符。若要写入一段字符串，先按应用选择的编码转成字节，再转 Base64。各类记录都支持可选的 `identifierBase64`。

## 保留或初始化

```js
export async function initializeTag() {
  const marker = { domain: 'example.com', type: 'initialized' };
  return await sfiora.initializeNdef({
    records: [{
      kind: 'external',
      domain: marker.domain,
      type: marker.type,
      payloadBase64: 'AQID',
    }],
  }, marker, { timeoutMilliseconds: 30000 });
}
```

将 `example.com` 换成应用自己的小写域名和类型约定。待写入消息必须包含**恰好一条**匹配 marker 的 External Type 记录，插件不会自动补标记。

- 已有消息包含相同 domain/type：返回 `action: 'preserved'`，不写入，返回已有的 `tag`；没有 `verified` 和写入字节数字段。标记记录的 payload 不参与匹配，也不会因传入新 payload 而更新。
- 没有匹配标记：替换整条消息并回读验证，返回 `action: 'initialized'` 和 `verified: true`。已有其他内容但没有这个标记的标签也会被覆盖。
- 无法检查现有消息时返回错误，不把读取失败当成空白。未格式化的出厂标签不会由此自动格式化。

这是一种应用约定的保留机制，不会把标签设为只读，也不是密码保护或身份认证。其他写入工具仍然可以覆盖标记；身份校验、授权、加密和业务格式由宿主负责。

在 x Vapor 中，写入和初始化使用相同消息对象，方法返回 `Promise<UTSJSONObject>`。例如将方法声明为 `async function replaceTag(): Promise<UTSJSONObject>`，读取 `action` 时用 `result['action'] as string | null`。

## 取消、页面生命周期与按钮状态

取消没有进行中的操作不会报错。取消方法完成只代表请求已送达，原始读写 Promise 的失败仍需处理，也不代表系统 NFC 面板已经收起。

页面应同时禁用读取和写入入口，条件是“本地有未完成调用，或 `isScanning()` / `isWriting()` 任一为 true”。iOS 成功结果可能在系统面板收起前返回，因此不能在 `finally` 中直接恢复按钮；继续查询状态，确认两项都为 false 后再恢复。状态查询失败应显示错误，不按 idle 处理。

`await sfiora.waitForIdle({ timeoutMilliseconds: 5000 })` 可统一完成等待，legacy 的 JS SDK、UTS JS SDK 和直接 UTS API 均支持。超时参数为 1–60000 的整数，默认 5000；查询失败原样返回错误，超时返回 `SESSION_CLOSE_TIMEOUT`，即使查询没有回调也会结束等待。它不取消当前操作、不预留下一次会话，也不会在超时后释放原生占用；用户可刷新真实状态后再试。

原生关闭超过 5 秒时可先交付待处理结果，实际关闭前仍保持忙碌。

拥有当前操作的页面在 `onHide` / `onUnload` 中取消操作，并忽略页面离开后的迟到结果。不要让没有发起操作的页面随意取消另一个页面的会话。原生读写在进程内互斥，重复启动会返回忙错误。

## 可选的 Android 前台标签接管

前台接管及面板结束等待要求插件为 1.2.0 或更新版本，JS/UTS 代码与基座中的原生模块必须匹配。

默认不接管空闲标签。如果标签会一直贴在手机上，可在 NFC 页面显示期间开启前台接管，避免空闲标签打开其他标签处理页面。接管会忽略这些标签；读取、写入和初始化仍需主动调用原有方法。

用 `acquireForegroundDispatch(ownerId)` 申请，用 `releaseForegroundDispatch(ownerId)` 释放。重复申请同一个 ID 只保留一份请求，释放一次即可；释放不存在的 ID 不影响其他持有者，不同页面应使用不同 ID。ID 长度为 1–128 个 ASCII 字符，首字符为字母或数字，其余可使用字母、数字、`.`、`_`、`:`、`-`；每个原生控制器最多保留 128 个不同 ID，非法 ID 返回 `INVALID_OPTIONS`。

经典 uni-app 可将下面的生命周期和字段合入自己的 Vue 2 / Vue 3 页面。将 `foregroundState`、`foregroundError` 绑定到页面的状态与错误区域；读写结果使用独立字段。legacy 只需替换导入路径。

```js
import * as sfiora from '@/uni_modules/Sandrox-Sfiora/js_sdk/index.js';

let ownerSequence = 0;

export default {
  data() {
    return { foregroundOwner: null, foregroundState: null, foregroundError: null };
  },
  onShow() {
    if (uni.getSystemInfoSync().platform !== 'android' || this.foregroundOwner !== null) return;
    const ownerId = `nfc-page:${Date.now()}:${++ownerSequence}`;
    this.foregroundOwner = ownerId;
    this.foregroundError = null;
    sfiora.acquireForegroundDispatch(ownerId).then(state => {
      if (this.foregroundOwner === ownerId) this.foregroundState = state;
      else return sfiora.releaseForegroundDispatch(ownerId);
    }).catch(error => {
      if (this.foregroundOwner === ownerId) this.foregroundError = error;
      else console.error('NFC foreground cleanup failed', error);
    });
  },
  onHide() { this.releaseForeground(); },
  onUnload() { this.releaseForeground(); },
  methods: {
    releaseForeground() {
      const ownerId = this.foregroundOwner;
      this.foregroundOwner = null;
      this.foregroundState = null;
      if (ownerId !== null) {
        sfiora.releaseForegroundDispatch(ownerId)
          .catch(error => console.error('NFC foreground cleanup failed', error));
      }
    },
  },
};
```

退出时先释放；如果申请结果迟到，再用原 ID 释放一次。释放是幂等的，不会影响新一轮页面显示所用的 ID。`onHide` 与 `onUnload` 都可调用清理；拥有读写操作的页面还应按上一节取消自己的操作。

uni-app x Vapor 可把同一处理封装在独立的 `nfc-foreground.uts` 模块中。计数器留在模块作用域，使不同页面实例共享它。示例使用直接 UTS 入口，查询结果按 `UTSJSONObject` 取字段：

```uts
import * as sfiora from '@/uni_modules/Sandrox-Sfiora'

let ownerSequence = 0

export function attachNfcForeground(
  onState: (state: UTSJSONObject) => void,
  onError: (error: any) => void,
): () => void {
  if (uni.getSystemInfoSync().platform != 'android') return () => {}
  const ownerId = 'nfc-page:' + Date.now().toString() + ':' + (++ownerSequence).toString()
  let active = true
  const report = (error: any) => {
    if (active) onError(error)
    else console.error('NFC foreground cleanup failed', error)
  }
  sfiora.acquireForegroundDispatch(ownerId).then(async (state: UTSJSONObject) => {
    if (active) onState(state)
    else await sfiora.releaseForegroundDispatch(ownerId)
  }).catch(report)
  return () => {
    active = false
    sfiora.releaseForegroundDispatch(ownerId).catch(report)
  }
}
```

在页面的 `<script setup lang="uts">` 中接入下面的生命周期。首次进入等到 `onReady` 再申请，确保新页面的原生 Activity 已就绪；后续返回页面仍由 `onShow` 申请。示例用字符串保存接管诊断，实际页面可按 `state['state'] as string` 显示状态；它们与原始读写结果分开：

```uts
import { ref } from 'vue'
import { onShow, onReady, onHide, onUnload } from '@dcloudio/uni-app'
import { attachNfcForeground } from './nfc-foreground.uts'

const foregroundJson = ref('')
const foregroundError = ref('')
let releaseForeground: (() => void) | null = null
let pageReady = false
let visible = false

function leaveForeground() {
  const release = releaseForeground
  releaseForeground = null
  if (release != null) release()
}
function enterForeground() {
  if (!pageReady || !visible || releaseForeground != null) return
  foregroundError.value = ''
  releaseForeground = attachNfcForeground(
    (state: UTSJSONObject) => { foregroundJson.value = JSON.stringify(state) },
    (error: any) => { foregroundError.value = JSON.stringify(error) },
  )
}
onShow(() => {
  visible = true
  enterForeground()
})
onReady(() => {
  pageReady = true
  enterForeground()
})
onHide(() => {
  visible = false
  leaveForeground()
})
onUnload(() => {
  visible = false
  pageReady = false
  leaveForeground()
})
```

申请成功返回 `{ platform, revision, state, error }`，不代表 NFC 一定启用。`active` 表示已接管，`paused` 表示暂时没有前台 Activity，`nfcDisabled` 表示 NFC 开关关闭，`unavailable` 表示无 NFC 硬件，`disabled` 表示没有请求，`failed` 表示失败且 `error` 包含诊断。应用从后台或设置页返回时，可通过 `getForegroundDispatchState()` 刷新快照；快照不是持续监听，查询失败也应单独显示。

Activity 暂停期间接管停用，请求保留，恢复前台或 NFC 开关变化后由插件重新处理。无需自行编写原生模块或接收器，也不要同时启用其他 NFC 前台分发实现。iOS 查询固定返回 `{ platform: 'ios', revision: 0, state: 'unavailable', error: null }`；申请和释放先校验 ID，再返回 `NFC_UNSUPPORTED`，所以上述示例只在 Android 申请。

`error` 为诊断字符串或 `null`；`revision` 仅在同一原生控制器的状态或错误变化时递增，控制器重建后重新计数。多个控制器位于同一 Activity 时共享注册，释放一个不影响其他请求；不同 Activity 同时申请会返回 `failed`，不会替换已有注册，应等先前 Activity 暂停后重试。

## 等待 Android 操作面板结束

需要完整展示成功反馈后再跳转时，在原始操作返回后分别等待会话空闲和面板结束。`getPresentationState()` 返回 `{ platform, supported, activePresentationIds }`；Android 的集合包含进程内 Sfiora 当前实际显示的面板，包括成功反馈和关闭动画。

`waitForPresentationEnd()` 在原生端开始执行时捕获这个集合，全部关闭后完成 Promise，没有返回值；空集合立即完成，后续新面板不延长等待。ID 只供临时识别，不应保存为业务标识；无面板读取不产生 ID，提前调用也不会等待未来才显示的面板。它只接受可选的 `timeoutMilliseconds`，范围为整数 1–60000，默认 5000 毫秒。非法参数返回 `INVALID_OPTIONS`，超时返回 `PRESENTATION_TIMEOUT`；超时不取消操作、不强制关闭面板、不释放 NFC 占用。

iOS 查询返回 `supported: false`、`activePresentationIds: []`，等待在校验参数后返回 `NFC_UNSUPPORTED`。空数组不代表系统面板已经消失；iOS 仍按会话状态安排下一次操作。

下面是经典 uni-app 的 JS 辅助函数。调用方通过两个回调分别保存读写结果与带方法名的错误，等待错误追加显示，不能覆盖原结果。返回值只表示等待是否成功，不表示读取成功；页面已离开或操作已被替换时，应忽略它的回调和返回值。

```js
// 沿用上面的 sfiora 导入；由页面点击事件调用。
export async function readAndWaitForUi(onResult, onError) {
  let ready = true;
  const observe = async (step, task) => {
    try {
      await task;
    } catch (error) {
      ready = false;
      onError(step, error);
    }
  };
  try {
    onResult(await sfiora.startScan());
  } catch (error) {
    onError('startScan', error);
  } finally {
    const waits = [observe('waitForIdle', sfiora.waitForIdle())];
    if (uni.getSystemInfoSync().platform === 'android') {
      waits.push(observe('waitForPresentationEnd',
        sfiora.waitForPresentationEnd({ timeoutMilliseconds: 10000 })));
    }
    await Promise.all(waits);
  }
  return ready;
}
```

在 UTS 中使用同样的执行顺序；将 `onResult` 声明为 `(tag: UTSJSONObject) => void`，`onError` 为 `(step: string, error: any) => void`，函数返回 `Promise<boolean>`。局部 `observe` 的签名为 `(step: string, task: Promise<void>): Promise<void>`，`waits` 为 `Promise<void>[]`。直接 UTS 与 JS SDK 都使用同一组等待方法，错误按字段处理。

等待期间保持按钮禁用。仅当页面和操作仍然有效且返回 `true`，才结合设备可用状态恢复按钮；返回 `false` 时重新查询会话及面板，查询失败不能按空闲处理。写入、初始化和取消使用相同的结束观察流程；尤其不能把等待错误解释成写入失败并自动重写。

如果希望保留完整动画，等待期间不要启动替换操作或用取消方法隐藏已完成的面板。同一控制器的新操作及宿主销毁可能直接关闭旧面板。

## 参数

读取的通用参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `mode` | `automatic` | `automatic`、`ndef` 或 `discover`，行为见读取示例 |
| `timeoutMilliseconds` | `30000` | `1000`–`60000` 的整数，单位毫秒 |
| `messages` | 内置提示语 | 自定义时提供完整的 `NfcScanMessages` |

Android 读取设置放入 `android` 对象：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `presentation` | `managed` | `none` 关闭读取面板 |
| `deepReadEnabled` | `false` | 对支持的标签启用额外只读协议探测 |
| `presenceCheckDelayMilliseconds` | `250` | `50`–`5000` 的整数 |

iOS 的 `ios.pollingTechnologies` 默认为 `['iso14443', 'iso15693']`，必须为非空数组；添加 `iso18092` 需配置 FeliCa 系统码。它控制 `automatic`、`discover` 的轮询，`ndef` 模式使用系统 NDEF 读取会话。Android、iOS 两组参数在两端都会校验，但只影响对应平台的读取行为。

写入选项只有 `timeoutMilliseconds`（范围和默认值同上）及完整的 `NfcWriteMessages`，不接受读取专用选项。Android 桥接写入使用操作面板，iOS 使用系统 NFC 面板。读取或写入选项中的未知参数、错误类型或不完整的自定义提示语会返回 `INVALID_OPTIONS`。完整字段见包内 `js_sdk/index.d.ts` 和 `contract/types.d.ts`。

## 错误处理

错误包含 `code`、`message`、`recoverable` 和可选 `nativeError`。按字符串 `code` 分支，不依赖设备原生错误文案：

| 错误码 | 处理方向 |
| --- | --- |
| `NFC_UNSUPPORTED` / `NFC_DISABLED` | 检查硬件支持或引导开启 NFC |
| `SCAN_BUSY` / `WRITE_BUSY` | 等当前会话释放，避免连续自动重试 |
| `USER_CANCELLED` | 正常结束这次交互 |
| `SESSION_CLOSE_TIMEOUT` | 保留原生状态门控，允许刷新，不能假定会话已关闭 |
| `PRESENTATION_TIMEOUT` | 保留原操作结果，刷新面板及会话状态后再继续 |
| `SCAN_TIMEOUT` / `WRITE_TIMEOUT` / `TAG_LOST` | 调整贴合位置后由用户重试 |
| `UNSUPPORTED_TAG` / `TAG_READ_ONLY` / `NDEF_CAPACITY_EXCEEDED` | 更换合适的可写 NDEF 标签或缩小消息 |
| `READ_FAILED` | 检查读取错误，不能按空标签继续处理 |
| `WRITE_FAILED` / `WRITE_VERIFICATION_FAILED` | 重新读取确认标签现状 |
| `INVALID_OPTIONS` | 修正参数 |
| `INTERNAL_ERROR` | 检查基座、模块加载、页面生命周期及原生错误 |

`recoverable` 只是重试提示，不保证标签未改变；写入期间的取消、超时和丢失标签也遵循前面的写入不确定性说明。

## 常见接入问题

- **提示模块不存在**：核对安装目录、legacy 原生插件勾选、导入路径，以及运行时选择的自定义基座。只更新 JS 不能补入缺失的原生模块。
- **iOS 会话无法开始**：核对用途说明、最终签名中的 `TAG` entitlement、App ID 与描述文件；修改后重打基座或 App。
- **手机打开了系统标签页面**：先启动 Sfiora 操作再贴标签；若标签会一直贴在手机上，可在 Android 页面显示期间启用上面的前台标签接管。需要自行处理空闲标签内容时，由宿主选择自己的分发方案，勿与 Sfiora 接管同时注册。
- **取消后按钮暂时不可点**：确认正在等待真实会话释放；按钮状态应与原生状态一致。
- **读到技术信息却不能写**：能发现某种技术不等于能写该标签；写入只面向已支持 NDEF 的可写标签。

## 隐私、能力边界与许可

插件在设备上读取、处理并返回标签数据，按调用方提供的内容写入标签。它无广告、统计或推广 SDK，不向作者服务器上传标签内容，也不在宿主设备持久化标签内容；业务校验和后续存储由调用方负责。

Sfiora 不提供标签格式化、永久锁定、密码修改、门禁卡复制、卡模拟或任意 APDU/私有区写入。标记与读取出的 ID 不构成身份真实性证明。

[源码与问题反馈](https://github.com/sandroxy/sfiora) · [版本记录](https://github.com/sandroxy/sfiora/blob/main/CHANGELOG.md) · [Apache License 2.0](https://github.com/sandroxy/sfiora/blob/main/LICENSE)

反馈时提供插件版本、HBuilderX 版本、宿主模式、系统与设备、操作和结构化错误；标签私密内容请先去除。

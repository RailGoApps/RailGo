# railgo-dynamic-icon

基于鸿蒙 `AppGalleryKit.appInfoManager` 的 UTS 插件，用于在 UniApp 鸿蒙端实现应用图标的动态切换。

## 功能

- `uni.queryDynamicIcons`：查询当前可用的动态图标信息。
- `uni.selectDynamicIcon`：切换到指定的动态图标。
- `uni.disableDynamicIcon`：禁用动态图标，恢复默认图标。

## 使用方式

### 方式一：挂载到 uni 全局对象

在任意页面中引入一次插件，即可通过 `uni.xxx` 调用：

```vue
<script lang="uts">
// 需要在任意页面中引入 1 次，不然会被摇掉
import "@/uni_modules/railgo-dynamic-icon";

export default {
  methods: {
    // 查询动态图标
    queryIcons() {
      uni.queryDynamicIcons({
        success: (res) => {
          console.log('动态图标列表：', JSON.stringify(res.iconInfos));
        },
        fail: (err) => {
          console.error('查询失败：', err.errMsg);
        }
      });
    },
    // 切换动态图标
    selectIcon(iconId: string) {
      uni.selectDynamicIcon({
        iconId: iconId,
        success: (res) => {
          console.log('切换成功：', res.errMsg);
        },
        fail: (err) => {
          console.error('切换失败：', err.errMsg);
        }
      });
    },
    // 恢复默认图标
    resetIcon() {
      uni.disableDynamicIcon({
        success: (res) => {
          console.log('已恢复默认图标：', res.errMsg);
        },
        fail: (err) => {
          console.error('恢复失败：', err.errMsg);
        }
      });
    }
  }
}
</script>
```

### 方式二：import 引入

```ts
import {
  queryDynamicIcons,
  selectDynamicIcon,
  disableDynamicIcon
} from "@/uni_modules/railgo-dynamic-icon";

queryDynamicIcons({
  success: (res) => {
    console.log('动态图标列表：', JSON.stringify(res.iconInfos));
  },
  fail: (err) => {
    console.error('查询失败：', err.errMsg);
  }
});
```

## 注意事项

- 该能力仅在鸿蒙真机环境生效，不支持模拟器。
- 需要应用已在 AppGallery 上架并配置了动态图标。
- 运行系统版本要求：AppGallery Kit 5.0.3(15) 及以上。

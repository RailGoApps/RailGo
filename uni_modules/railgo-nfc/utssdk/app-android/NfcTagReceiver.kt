/*
 * 前台扫描标签广播接收器（参照 Sfiora 成品插件：组件类必须由 .kt 原生文件承载）。
 *
 * ⚠️ uni-app(非 x) 云打包会把插件内所有 .uts 合并成单个 index.kt，.uts 二级文件里的
 * class 声明会被静默丢弃（实测 dex 中只有 IndexKt）→ manifest 声明的组件类必须放本文件。
 * .kt 文件会被直接编入 :uni_modules:railgo-nfc 模块。
 *
 * 职责极窄：仅把系统前台分发的 Tag 对象入静态队列，不做任何 RF I/O、不回调 JS。
 * UTS 侧（IndexKt）通过 @JvmStatic 方法消费队列并解析/写入。
 */
package com.railgo.nfc

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Build

class NfcTagReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        try {
            val tag: Tag? = if (Build.VERSION.SDK_INT >= 33) {
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            }
            if (tag != null) {
                enqueue(tag)
            }
        } catch (e: Throwable) {
            // 接收器内异常会杀进程，只打日志
            android.util.Log.e("railgo-nfc", "receiver onReceive error: $e")
        }
    }

    companion object {
        private val lock = Any()
        private val pendingTags = ArrayList<Tag>()
        private var lastTag: Tag? = null

        @JvmStatic
        fun enqueue(tag: Tag) {
            synchronized(lock) {
                pendingTags.add(tag)
                lastTag = tag
            }
        }

        @JvmStatic
        fun hasPending(): Boolean = synchronized(lock) { pendingTags.isNotEmpty() }

        @JvmStatic
        fun takePendingTag(): Tag? = synchronized(lock) {
            if (pendingTags.isEmpty()) null else pendingTags.removeAt(0)
        }

        /** 最近一次收到的原始 Tag（供 writeNdef 使用，不清空） */
        @JvmStatic
        fun peekLastTag(): Tag? = synchronized(lock) { lastTag }
    }
}

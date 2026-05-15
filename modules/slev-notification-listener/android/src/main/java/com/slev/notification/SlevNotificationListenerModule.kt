package com.slev.notification

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.ref.WeakReference

class SlevNotificationListenerModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  init {
    reactContextRef = WeakReference(reactContext)
  }

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun isPermissionGranted(promise: Promise) {
    promise.resolve(hasNotificationAccess(reactContext))
  }

  @ReactMethod
  fun openPermissionSettings(promise: Promise) {
    val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactContext.startActivity(intent)
    promise.resolve(null)
  }

  @ReactMethod
  fun startListening(promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by NativeEventEmitter.
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required by NativeEventEmitter.
  }

  companion object {
    private const val MODULE_NAME = "SlevNotificationListener"
    const val EVENT_NAME = "SlevNotificationReceived"
    private var reactContextRef: WeakReference<ReactApplicationContext>? = null

    fun emitNotification(packageName: String, title: String?, body: String?, receivedAt: String) {
      if (body.isNullOrBlank() && title.isNullOrBlank()) return
      if (looksSensitive(title, body)) return

      val context = reactContextRef?.get() ?: return
      val payload = Arguments.createMap().apply {
        putString("title", title)
        putString("body", body ?: "")
        putString("packageName", packageName)
        putString("receivedAt", receivedAt)
      }

      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(EVENT_NAME, payload)
    }

    private fun hasNotificationAccess(context: ReactApplicationContext): Boolean {
      val enabledListeners = Settings.Secure.getString(
        context.contentResolver,
        "enabled_notification_listeners"
      )
      if (enabledListeners.isNullOrBlank()) return false

      val expectedName = ComponentName(context, SlevNotificationListenerService::class.java)
      return TextUtils.split(enabledListeners, ":").any {
        ComponentName.unflattenFromString(it) == expectedName
      }
    }

    private fun looksSensitive(title: String?, body: String?): Boolean {
      val text = listOfNotNull(title, body).joinToString(" ").lowercase()
      val sensitiveWords = listOf(
        "otp",
        "kode verifikasi",
        "kode rahasia",
        "password",
        "pin",
        "token",
        "saldo",
        "balance",
        "rekening"
      )

      return sensitiveWords.any { text.contains(it) }
    }
  }
}

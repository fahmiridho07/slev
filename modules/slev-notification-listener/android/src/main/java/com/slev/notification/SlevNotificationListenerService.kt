package com.slev.notification

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.text.TextUtils
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SlevNotificationListenerService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) return

    val extras = sbn.notification.extras
    val title = extras.getCharSequence("android.title")?.toString()
    val body = extractBody(sbn)
    val receivedAt = isoTimestamp(sbn.postTime)

    SlevNotificationListenerModule.emitNotification(
      packageName = sbn.packageName,
      title = title,
      body = body,
      receivedAt = receivedAt
    )
  }

  private fun extractBody(sbn: StatusBarNotification): String? {
    val extras = sbn.notification.extras
    val text = extras.getCharSequence("android.text")?.toString()
    if (!text.isNullOrBlank()) return text

    val bigText = extras.getCharSequence("android.bigText")?.toString()
    if (!bigText.isNullOrBlank()) return bigText

    val textLines = extras.getCharSequenceArray("android.textLines")
    if (!textLines.isNullOrEmpty()) {
      return TextUtils.join(" ", textLines.filterNotNull())
    }

    return null
  }

  private fun isoTimestamp(epochMillis: Long): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
    formatter.timeZone = TimeZone.getTimeZone("UTC")
    return formatter.format(Date(epochMillis))
  }
}

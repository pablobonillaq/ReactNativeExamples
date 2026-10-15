package com.reactnativeexamples.clipboard

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

/**
 * Copies an image file to the Android clipboard.
 *
 * Android's clipboard can't hold image bytes: it holds a content:// URI that
 * other apps read when the user pastes. The file is exposed through a
 * FileProvider (see res/xml/clipboard_paths.xml); the system grants read
 * access to the app that pastes it.
 */
class ImageClipboardModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  override fun getName() = NAME

  @ReactMethod
  fun copyImage(path: String, promise: Promise) {
    try {
      val file = File(path.removePrefix("file://"))
      if (!file.exists()) {
        promise.reject("E_NOT_FOUND", "Image not found: $path")
        return
      }
      val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.clipboard.fileprovider",
        file,
      )
      val clipboard =
        context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      clipboard.setPrimaryClip(ClipData.newUri(context.contentResolver, "Image", uri))
      promise.resolve(uri.toString())
    } catch (e: Exception) {
      promise.reject("E_CLIPBOARD", e.message, e)
    }
  }

  companion object {
    const val NAME = "ImageClipboard"
  }
}

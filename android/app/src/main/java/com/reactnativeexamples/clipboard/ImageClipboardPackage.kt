package com.reactnativeexamples.clipboard

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ImageClipboardPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
    listOf(ImageClipboardModule(context))

  override fun createViewManagers(
    context: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}

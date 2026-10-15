package com.reactnativeexamples

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.reactnativeexamples.clipboard.ImageClipboardPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // App's own native module: copy images to the clipboard (Android).
          add(ImageClipboardPackage())
          // Turbo Native Module: todo list stored in SharedPreferences.
          add(NativeTodosPackage())
          // Turbo Native Module for the Bridging screen.
          add(NativeBridgeDemoPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}

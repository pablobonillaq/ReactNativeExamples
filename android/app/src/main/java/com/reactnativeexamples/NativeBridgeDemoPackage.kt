package com.reactnativeexamples

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** Registers the "NativeBridgeDemo" Turbo Module (see MainApplication). */
class NativeBridgeDemoPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == NativeBridgeDemoModule.NAME) NativeBridgeDemoModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      NativeBridgeDemoModule.NAME to
        ReactModuleInfo(
          name = NativeBridgeDemoModule.NAME,
          className = NativeBridgeDemoModule.NAME,
          canOverrideExistingModule = false,
          needsEagerInit = false,
          isCxxModule = false,
          isTurboModule = true,
        ),
    )
  }
}

package com.reactnativeexamples

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * Tells React Native that a Turbo Module called "NativeTodos" exists and how
 * to create it. Registered in MainApplication. The module is created lazily,
 * the first time JS calls TurboModuleRegistry.get('NativeTodos').
 */
class NativeTodosPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == NativeTodosModule.NAME) NativeTodosModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      NativeTodosModule.NAME to
        ReactModuleInfo(
          name = NativeTodosModule.NAME,
          className = NativeTodosModule.NAME,
          canOverrideExistingModule = false,
          needsEagerInit = false,
          isCxxModule = false,
          isTurboModule = true,
        ),
    )
  }
}

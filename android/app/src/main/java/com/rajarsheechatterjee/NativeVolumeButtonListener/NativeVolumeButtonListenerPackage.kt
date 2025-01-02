package com.rajarsheechatterjee.NativeVolumeButtonListener

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NativeVolumeButtonListenerPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == NativeVolumeButtonListener.NAME) {
            NativeVolumeButtonListener(reactContext)
        } else {
            null
        }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeVolumeButtonListener.NAME to ReactModuleInfo(
                NativeVolumeButtonListener.NAME,
                NativeVolumeButtonListener.NAME,
                _canOverrideExistingModule = false,
                _needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}

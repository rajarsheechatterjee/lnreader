package com.rajarsheechatterjee.NativeVolumeButtonListener

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.lnreader.spec.NativeVolumeButtonListenerSpec

class NativeVolumeButtonListener(appContext: ReactApplicationContext) :
    NativeVolumeButtonListenerSpec(appContext) {
    init {
        NativeVolumeButtonListener.appContext = appContext
    }

    override fun addListener(eventName: String?) {
        isActive = true
    }

    override fun removeListeners(count: Double) {
        isActive = false
    }

    companion object {
        lateinit var appContext: ReactApplicationContext
        var isActive = false
            private set

        fun sendEvent(up: Boolean) {
            if (isActive) {
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(if (up) "VolumeUp" else "VolumeDown", null)
            }
        }
        const val NAME = "NativeVolumeButtonListener"
    }
}

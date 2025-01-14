package com.rajarsheechatterjee.LNReaderDev

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.rajarsheechatterjee.EpubUtil.EpubUtilPackage
import com.rajarsheechatterjee.FileManager.FileManagerPackage
import com.rajarsheechatterjee.VolumeButtonListener.VolumeButtonListenerPackage
import com.rajarsheechatterjee.ZipArchive.ZipArchivePackage
import expo.modules.ApplicationLifecycleDispatcher.onApplicationCreate
import expo.modules.ApplicationLifecycleDispatcher.onConfigurationChanged
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost: ReactNativeHost =
        ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
            override fun getUseDeveloperSupport(): Boolean {
                return BuildConfig.DEBUG
            }

            override fun getPackages(): List<ReactPackage> {
                val packages: MutableList<ReactPackage> = PackageList(this).packages
                packages.add(VolumeButtonListenerPackage())
                packages.add(ZipArchivePackage())
                packages.add(FileManagerPackage())
                packages.add(EpubUtilPackage())
                return packages
            }

            override fun getJSMainModuleName(): String {
                return "index"
            }

            override val isNewArchEnabled: Boolean
                get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean
                get() = BuildConfig.IS_HERMES_ENABLED
        })

    override fun getReactNativeHost(): ReactNativeHost {
        return mReactNativeHost
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this,  /* native exopackage */false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        onConfigurationChanged(this, newConfig)
    }
}

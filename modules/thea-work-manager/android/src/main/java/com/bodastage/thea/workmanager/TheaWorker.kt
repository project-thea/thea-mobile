package com.bodastage.thea.workmanager

import android.content.Context
import androidx.work.*
import android.util.Log
import com.facebook.react.ReactApplication
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TheaWorker(private val appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val application = appContext.applicationContext as ReactApplication
            val reactInstanceManager = application.reactNativeHost.reactInstanceManager
            val reactContext: com.facebook.react.bridge.ReactContext? = reactInstanceManager?.currentReactContext

            if (reactContext != null) {
                TheaWorkManagerModule.emitEvent(reactContext, "locations_background_sync_start")
            } else {
                throw Exception("No ReactContext found")
            }

            Log.e("TheaWorker", "The background work is running!")

            Result.success()
        } catch (e: Exception) {
            Log.e("TheaWorker", "Could not start background work: ${e.message}")
            Result.failure()
        }
    }
}

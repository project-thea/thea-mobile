package com.bodastage.thea.workmanager

import java.util.concurrent.TimeUnit
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import androidx.work.*
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log

class TheaWorkManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TheaWorkManager")

    // Defines event names that the module can send to JavaScript.
    Events("locations_background_sync_start")

    Function("registerTask"){ taskName: String, interval: Int ->
      val context = appContext.reactContext ?: throw Exception("No context found")

      val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()

      val workRequest = PeriodicWorkRequestBuilder<TheaWorker>(
        interval.toLong(), TimeUnit.SECONDS,
        15, TimeUnit.MINUTES,
        )
        .setConstraints(constraints)
        .build()

      WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        taskName,
        ExistingPeriodicWorkPolicy.KEEP,
        workRequest
      )

      Log.d("TheaWorkManager", "Task '$taskName' registered with interval: $interval")
    }

    Function("deregisterTask"){ taskName: String ->
      val context = appContext.reactContext ?: throw Exception("No context found")

      WorkManager.getInstance(context).cancelUniqueWork(taskName)
      Log.d("TheaWorkManager", "Task '$taskName' deregistered")
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

  }

  companion object {
    fun emitEvent(context: com.facebook.react.bridge.ReactContext, eventName: String){
      context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(eventName, null) // don't send any additional params at the moment
    }
  }

}

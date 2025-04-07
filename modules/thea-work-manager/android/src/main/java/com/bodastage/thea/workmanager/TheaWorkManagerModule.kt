package com.bodastage.thea.workmanager

import android.util.Log
import androidx.work.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.TimeUnit

class TheaWorkManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TheaWorkManager")

    // Defines event names that the module can send to JavaScript.
    Events("locations_background_sync_start")

    Function("helloWorld"){  ->
      Log.d("TheaWorkManager", "Hello World from Kotlin!")
    }

    Function("registerTask"){ taskName: String, interval: Int, schemaVersion: Int, baseUrl: String ->
      val context = appContext.reactContext ?: throw Exception("No context found")

      val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()

      val workRequest = PeriodicWorkRequestBuilder<TheaWorker>(
        interval.toLong(), TimeUnit.MILLISECONDS,
        5, TimeUnit.MINUTES,
        )
        .setInputData(workDataOf("SCHEMA_VERSION" to schemaVersion, "BASE_URL" to baseUrl))
        .setConstraints(constraints)
        .setInitialDelay(0, TimeUnit.MILLISECONDS)
        .build()

      WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        taskName,
        ExistingPeriodicWorkPolicy.REPLACE,
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

}

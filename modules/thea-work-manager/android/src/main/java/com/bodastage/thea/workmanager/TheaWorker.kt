package com.bodastage.thea.workmanager

import android.content.Context
import android.util.Log
import androidx.work.*
import io.realm.kotlin.Realm
import io.realm.kotlin.RealmConfiguration
import io.realm.kotlin.ext.query
import io.realm.kotlin.types.RealmObject
import io.realm.kotlin.types.annotations.PrimaryKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

object SyncStatus {
    const val PENDING = "PENDING"
    const val SYNCED = "SYNCED"
}

class Subject : RealmObject {
    var access: String = ""
    var refresh: String = ""
    var isSignedIn: Boolean = false

    @PrimaryKey
    var subjectId: String = ""
}

class Location : RealmObject {
    @PrimaryKey
    var locationId: String = ""
    var latitude: String = ""
    var longitude: String = ""
    var subject: String = ""
    var syncStatus: String = ""
    var timestamp: String = ""
}

fun getUnsyncedLocations(realm: Realm): List<Location> {
    return realm.query<Location>("syncStatus == $0", SyncStatus.PENDING).find()
}

suspend fun markLocationsAsSynced(realm: Realm, locations: List<Location>) {
    locations.forEach { location ->
        realm.query<Location>("locationId == $0", location.locationId)
            .first()
            .find()
            ?.also { foundLocation ->
                realm.writeBlocking {
                    findLatest(foundLocation)?.syncStatus = "SYNCED"
                }
            }
    }
}

suspend fun clearSyncedLocations(realm: Realm) {
    realm.writeBlocking {
        // Find synced locations directly within the write transaction
        val syncedLocations = query<Location>("syncStatus == $0", "SYNCED").find()

        if (syncedLocations.isNotEmpty()) {
            delete(syncedLocations)
        }
    }
}

fun openRealmConnection(appContext: Context, schemaVersion: Long): Realm {
    val realmFileDir = appContext.filesDir
    val config = RealmConfiguration
        .Builder(schema = setOf(Subject::class, Location::class))
        .directory(realmFileDir.path)
        .name("default.realm")
        .schemaVersion(schemaVersion)
        .build()

    val realm = Realm.open(config)
    return realm
}

fun locationObjectsToJson(locations: List<Location>): Map<String, List<Map<String, String>>> {
     val locationObjects = locations
         .map { location ->
             mapOf(
                 "latitude" to location.latitude,
                 "longitude" to location.longitude,
                 "subject" to location.subject,
             )
         }

     val json = mapOf("locations" to locationObjects)
     return json
}

fun saveLocationsAPI(apiUrl: String, unSyncedLocations: List<Location>): Boolean {
    var connection: HttpURLConnection? = null
    return try {
        val url = URL(apiUrl)
        connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("Accept", "application/json")
        connection.doOutput = true

        val jsonBody = locationObjectsToJson(unSyncedLocations)
        val jsonObject = JSONObject(jsonBody)
        val requestBody = jsonObject.toString().toByteArray(StandardCharsets.UTF_8)

        connection.outputStream.use { stream ->
            stream.write(requestBody)
        }

        connection.responseCode in 200..299
    } catch (e: Exception) {
        Log.e("TheaWorker", "Error saving locations to API: ${e.stackTrace} \n ${e.message}")
        e.printStackTrace()
        false
    } finally {
        connection?.disconnect()
    }
}

class TheaWorker(
    private val appContext: Context,
    workerParams: WorkerParameters,
    ) :
    CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val schemaVersion = inputData.getLong("SCHEMA_VERSION", 1)
            val baseUrl = inputData.getString("BASE_URL")

            val realm = openRealmConnection(appContext, schemaVersion)
            val unSyncedLocations = getUnsyncedLocations(realm)
            clearSyncedLocations(realm)

            if(unSyncedLocations.isNotEmpty()) {
                val url = "$baseUrl/api/locations/"

                val successful = saveLocationsAPI(url, unSyncedLocations)

                if (successful){
                    markLocationsAsSynced(realm, unSyncedLocations)
                } else {
                    Log.d("TheaWorker", "Could not sync locations successfully")
                    Result.failure()
                }
            }

            Result.success()
        } catch (e: Exception) {
            Log.e("TheaWorker", "An error occurred in the background work: ${e.message} \n ${e.printStackTrace()}")
            Result.failure()
        }
    }
}

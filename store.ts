import Realm from "realm"
import { LocationRecord } from "./locations"
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
}


export const Subject = {
  name: 'Subject',
  primaryKey: 'subjectId',
  properties: {
    access: 'string', 
    refresh: 'string',
    isSignedIn: 'bool',
    subjectId: 'string',
  }
}

export const Location = {
  name: 'Location',
  primaryKey: 'locationId',
  properties: {
    locationId: 'string',
    latitude: 'string',
    longitude: 'string',
    subject: 'string',
    syncStatus: 'string', // can we infer this type from SyncStatus instead of hardcoding "string"
    timestamp: 'string',
  }
}

export class RealmService{
  static instance: Realm | null = null
  static CURR_SCHEMA_VERSION = 1

  static migrationFunctions: Record<string, (oldRealm: Realm, newRealm: Realm) => void> = {
    '0-1': (oldRealm: Realm, newRealm: Realm) => {
      console.log("Migrating from version 0 to 1")
      // | ---- SCHEMA------- | ----- NEW FIELDS ---- |
      // |     Location       |       timestamp       |
    }
  }

  private static getSchemaVersion(){
    // if no database at the default path e.g.
    // fresh install on a device
    if(Realm.schemaVersion(Realm.defaultPath) === -1){
      return RealmService.CURR_SCHEMA_VERSION
    }

    // the app is already installed on the device.
    // things like updates
    return Math.max(Realm.schemaVersion(Realm.defaultPath), RealmService.CURR_SCHEMA_VERSION)
  }

  private static defaultConfig: Realm.Configuration = {
    schema: [Subject, Location],
    schemaVersion: RealmService.getSchemaVersion(),
    onMigration: (oldRealm, newRealm) => {
      const oldSchemaVersion = oldRealm.schemaVersion

      // debugging
      console.log("Old schema version: ", oldRealm.schemaVersion)
      console.log("New schema version: ", newRealm.schemaVersion)

      // Migrate one version at a time
      for (let version = oldSchemaVersion; version < RealmService.CURR_SCHEMA_VERSION; version++) {
        const migrationKey = `${version}-${version + 1}`;
        const migrationFn = RealmService.migrationFunctions[migrationKey];

        if(migrationFn){
          migrationFn(oldRealm, newRealm)
        }
      }
    },
  }

  static isMigrationNeeded(){
    console.log("Current schema version: ", Realm.schemaVersion(Realm.defaultPath))
    if(Realm.schemaVersion(Realm.defaultPath) === -1){
      return false
    }

    return Realm.schemaVersion(Realm.defaultPath) < RealmService.CURR_SCHEMA_VERSION
  }

  static getInstance(){
    if(!RealmService.instance){
      RealmService.instance = new Realm(RealmService.defaultConfig)
    }

    return RealmService.instance
  }

  static getAccessToken(){
    const realm = RealmService.getInstance()  
    const access = realm.objects("Subject")[0]?.access

    return access
  }

  static migrate(){
    // close the existing realm
    if(RealmService.instance){
      RealmService.instance.close()
    }

    // does a realm exist at the default path? if yes, close it
    if(Realm.exists(Realm.defaultPath)){
      console.log("A realm exists at the default path. Will proceed to close it")
      const defaultRealmVersion = Realm.schemaVersion(Realm.defaultPath)
      const oldRealm = new Realm({ schemaVersion: defaultRealmVersion, path: Realm.defaultPath })
      oldRealm.close()
    }

    RealmService.instance = new Realm({...RealmService.defaultConfig, schemaVersion: RealmService.CURR_SCHEMA_VERSION})
  }

  static getRefreshToken(){
    const realm = RealmService.getInstance()
    const refresh = realm.objects("Subject")[0]?.refresh

    return refresh
  }

  static saveLocationCoordinates(location: LocationRecord, syncStatus: SyncStatus = SyncStatus.PENDING){
    const realm = RealmService.getInstance()

    realm.write(() => {
      realm.create('Location', {
        locationId: uuidv4().toString(),
        ...location,
        syncStatus,
      })
    })
  }

  static getUnsyncedLocations(){
    const realm = RealmService.getInstance()
    const locations = realm.objects("Location").filtered('syncStatus == $0', SyncStatus.PENDING)

    return locations // can we derive the types from that Location schema above?
  }

  static clearSyncedLocations(){
    const realm = RealmService.getInstance()
    const locations = realm.objects("Location").filtered('syncStatus == $0', SyncStatus.SYNCED)

    if(locations.length === 0) return

    realm.write(() => {
      realm.delete(locations)
    })
  }

  static markLocationsAsSynced(locations: any){
    const realm = RealmService.getInstance()

    realm.write(() => {
      locations.forEach((location: any) => {
        const locationRecord = realm.objects("Location").filtered('locationId == $0', location.locationId)[0]
        locationRecord.syncStatus = SyncStatus.SYNCED
      })
    })
  }
}
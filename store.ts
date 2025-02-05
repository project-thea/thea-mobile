import Realm from "realm"
import { LocationRecord } from "./locations"
import { v4 as uuidv4 } from 'uuid';

enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
}

const CURR_SCHEMA_VERSION = 1

export const Subject = {
  name: 'Subject',
  primaryKey: 'subjectId',
  properties: {
    token: 'string', 
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
  }
}

export class RealmService{
  static instance: Realm

  static getInstance(){
    if(!RealmService.instance){
      RealmService.instance = new Realm({
        schema: [Subject, Location],

        // TODO; write more resilient migration logic when the schema version changes
        schemaVersion: CURR_SCHEMA_VERSION,
        path: 'ver2.realm', // TODO: remove this
      })
    } 

    return RealmService.instance
  }

  static getUserToken(){
    const realm = RealmService.getInstance()
    const token = realm.objects("Subject")[0]?.token

    return token
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
}
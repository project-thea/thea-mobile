import Realm from "realm"

export const Subject = {
  name: 'Subject',
  primaryKey: 'subjectId',
  properties: {
    token: 'string', 
    isSignedIn: 'bool',
    subjectId: 'string',
  }
}

export class RealmService{
  static instance: Realm

  static getInstance(){
    if(!RealmService.instance){
      RealmService.instance = new Realm({
        schema: [Subject],
        // schemaVersion: 1
      })
    } 

    return RealmService.instance
  }

  static getUserToken(){
    const realm = RealmService.getInstance()
    const token = realm.objects("Subject")[0]?.token

    return token
  }

}
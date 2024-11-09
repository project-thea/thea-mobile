import { LocationObject } from "expo-location";

export interface LocationResponse extends LocationObject {
  id: string;
  isSynced: boolean;
  user: string;
}

export interface LocationResponseState {
  locations: LocationResponse[];
}

export interface LocationRecord {
  subject: string;
  latitude: string;
  longitude: string;
}

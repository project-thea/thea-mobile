import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import { locationsApi } from "@/services/api";
import { useQuery } from "@realm/react";
import { RealmService } from "@/store";

export default function MainScreen() {
  const [mainButtonText, setButtonText] = useState("Start tracking!");
  const [buttonColor, setButtonColor] = useState("#34eb5b");
  const [isTrackingButtonClicked, setIsTrackingButtonCliked] = useState(false);
  const [locationSubscription, setLocationSubscription] =
  useState<null | Location.LocationSubscription>(null);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout>();
  const [cleanUpInterval, setCleanUpInterval] = useState<NodeJS.Timeout>();

  const subject: any = useQuery('Subject')[0]
  const subjectId = subject?.subjectId
    
  const CHANNEL_ID = "22";
  const SAMPLING_INTERVAL    =  1 * 60 * 1000  // 1 minute(s)
  const SYNC_INTERVAL        =  5 * 60 * 1000  // 5 minute(s)
  const CLEANUP_INTERVAL     =  5 * 60 * 1000  // 5 minute(s)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // TODO; what happens if the user refuses to give location  permissions?
        console.log("Permission to access location was denied");
        return;
      }

      const channelConfig = {
        id: CHANNEL_ID,
        name: "Location tracking",
        description: "",
        enableVibration: false,
      };
  
      await VIForegroundService.getInstance().createNotificationChannel(
        channelConfig
      );

      const syncInterval = startSync()
      setSyncInterval(syncInterval)

      const cleanUpInterval = startCleanup()
      setCleanUpInterval(cleanUpInterval)
      
    })();

    return () => {
      stopTracking();
      setButtonText("Start tracking!");
      setButtonColor("#34eb5b");

      if(syncInterval){
        clearInterval(syncInterval)
      }

      if(cleanUpInterval){
        clearInterval(cleanUpInterval)
      }
    };
  }, []);

  const handleTrackingButtonClicked = () => {
    setIsTrackingButtonCliked(!isTrackingButtonClicked);
  };

  const startSync = () => {
    console.log("Starting sync");

    const syncInterval = setInterval(async () => {
      const locations = RealmService.getUnsyncedLocations()

      if(locations.length > 0){
        locations.forEach(async location => {
          const locationRecord = {
            latitude: location.latitude,
            longitude: location.longitude,
            subject: location.subject,
          }
          await locationsApi.saveLocation(locationRecord)
        })
      }
    }, SYNC_INTERVAL);

    return syncInterval
  }

  const startCleanup = () => {
    console.log("Starting cleanup");

    const cleanupInterval = setInterval(async () => {
        RealmService.clearSyncedLocations()
    }, CLEANUP_INTERVAL);

    return cleanupInterval
  }

  const startTracking = async () => {
    console.log("Starting tracking");

    const notificationConfig = {
      channelId: CHANNEL_ID,
      id: 2210,
      title: "Tracking in progress",
      text: "Tap to stop tracking",
      icon: "ic_launcher",
    };

    await VIForegroundService.getInstance().startService(notificationConfig, 1);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: SAMPLING_INTERVAL,
        distanceInterval: 50, // 50 metres
      },
      async (location) => {
        // TODO(functionality): sample every say 10 seconds but send data every say 5 mins

        try {
          const { latitude, longitude } = location.coords;
          const locationRecord = {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            subject: subjectId as string,
          };

          RealmService.saveLocationCoordinates(locationRecord)
        } catch (error: any) {
          console.error("Could not save location to local storage: ", error.message);
        }
      }
    );

    setLocationSubscription(subscription);
  };

  const stopTracking = async () => {
    console.log("Stopping tracking");

    try {
      await VIForegroundService.getInstance().stopService();
    } catch (error) {
      // console.error("Could not stop foreground service:  ", error);
    }

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  useEffect(() => {
    if (isTrackingButtonClicked) {
      startTracking();
      setButtonText("Stop tracking!");
      setButtonColor("#eb4034");
    } else {
      stopTracking();
      setButtonText("Start tracking!");
      setButtonColor("#34eb5b");
    }
  }, [isTrackingButtonClicked]);


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: buttonColor }}
        onPress={handleTrackingButtonClicked}
      >
        <Text style={styles.buttonText}>{mainButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

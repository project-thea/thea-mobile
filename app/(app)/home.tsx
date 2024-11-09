import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { useBaseUrl } from "@/hooks/useBaseUrl";
import { useSelector, useDispatch } from "react-redux";
import { addLocation, RootState, store } from "@/store";
import { v4 as uuidv4 } from "uuid";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import { API_BASE_URL, locationsApi } from "@/services/api";

export default function MainScreen() {
  const [mainButtonText, setButtonText] = useState("Start tracking!");
  const [buttonColor, setButtonColor] = useState("#34eb5b");
  const [isTrackingButtonClicked, setIsTrackingButtonCliked] = useState(false);
  const [locationSubscription, setLocationSubscription] =
  useState<null | Location.LocationSubscription>(null);
    
  const dispatch = useDispatch();
  const subjectId = useSelector((state: RootState) => state.auth.userId);
  const CHANNEL_ID = "22";

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
      
    })();

    // cleanup function to stop tracking
    // is this even getting called??
    return () => {
      stopTracking();
      setButtonText("Start tracking!");
      setButtonColor("#34eb5b");
    };
  }, []);

  const handleTrackingButtonClicked = () => {
    setIsTrackingButtonCliked(!isTrackingButtonClicked);
  };

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
        timeInterval: 2 * 60 * 1000, // 2 minutes
        distanceInterval: 50, // 50 metres
      },
      async (location) => {
        // TODO(functionality): sample every say 10 seconds but send data every say 5 mins

        // dispatch(
        //   addLocation({
        //     ...location,
        //     isSynced: false,
        //     user: subjectId,
        //     id: uuidv4(),
        //   })
        // );

        try {
          const { latitude, longitude } = location.coords;

          await locationsApi.saveLocation(
            {
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
                subject: subjectId as string
            }
          )
        } catch (error: any) {
          console.error("Error saving location: ", error.message);
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

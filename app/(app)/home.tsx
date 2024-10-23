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
import { addLocation } from "@/store";
import { v4 as uuidv4 } from "uuid";
import VIForegroundService from "@voximplant/react-native-foreground-service";

export default function MainScreen() {
  const [mainButtonText, setButtonText] = useState("Start tracking!");
  const [buttonColor, setButtonColor] = useState("#34eb5b");
  const [isTrackingButtonClicked, setIsTrackingButtonCliked] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<null | Location.LocationSubscription>(null);

  const baseUrl = useBaseUrl();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const locations = useSelector((state) => state.location.locations);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
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

    const channelConfig = {
      id: "22",
      name: "Tracking location",
      description: "Your location is being tracked and recorded",
      enableVibration: false,
    };
    await VIForegroundService.getInstance().createNotificationChannel(
      channelConfig
    );

    const notificationConfig = {
      channelId: "channelId",
      id: 2210,
      title: "Title",
      text: "Some text",
      icon: "ic_icon",
      button: "Some text",
    };

    await VIForegroundService.getInstance().startService(notificationConfig);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2 * 60 * 1000, // 2 minutes
        distanceInterval: 50, // 50 metres
      },
      async (location) => {
        console.log("location: ", location);
        dispatch(
          addLocation({
            ...location,
            isSynced: false,
            user: userId,
            id: uuidv4(),
          })
        );

        try {
          const { latitude, longitude } = location.coords;

          // TODO; save these locations to a local store even before trying to send them out??

          const response = await fetch(`${baseUrl}/api/locations/`, {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              "locations": [{
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
                user: userId
              }]
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            console.error("location save error: ", JSON.stringify(data));
            return;
          }
        } catch (error) {
          console.error("OOPS: ", error);
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

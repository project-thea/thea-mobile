import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform
} from "react-native";
import * as Location from 'expo-location';
import { useBaseUrl } from "@/hooks/useBaseUrl";
import { useSelector } from "react-redux";

export default function MainScreen() {
  const [mainButtonText, setButtonText] = useState("Start tracking!");
  const [buttonColor, setButtonColor] = useState("#34eb5b");
  const [isTrackingButtonClicked, setIsTrackingButtonCliked] = useState(false);
  const [location, setLocation] = useState<null|Location.LocationObject>(null);
  const [locationSubscription, setLocationSubscription] = useState<null|Location.LocationSubscription>(null);

  const baseUrl = useBaseUrl();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);

  // console.log("user id: ", userId);

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
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

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2*60*1000, // 2 minutes
        distanceInterval: 50, // 50 metres
      },
      async (location) => {
        console.log("Location: ", location);

        try {
          const {latitude, longitude} = location.coords;
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
          if (response.ok) {
            console.log("location save response: ", JSON.stringify(data));
            return;
          } else {
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

  const stopTracking = () => {
    console.log("Stopping tracking");

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

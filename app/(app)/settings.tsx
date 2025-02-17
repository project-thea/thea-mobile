import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function MainScreen() {  
  useEffect(() => {
  }, []);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Your settings will appear here!</Text>
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
    fontSize: 18,
    margin: "auto",
  }
});

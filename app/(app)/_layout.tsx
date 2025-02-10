import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Text, TouchableOpacity } from "react-native";
import { useRealm } from "@realm/react";
import { userApi } from "@/services/api";
import { RealmService } from "@/store";

function CustomDrawerContent(props) {
  const realm = useRealm()

  const handleSignOut = async () => {
    try {
      realm.write(() => {
        realm.deleteAll();
      });
    } catch (error) {}
    
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: "Home",
            title: "Home",
            headerShown: true,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            title: "Settings",
            headerShown: true,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = {
  signOutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
};

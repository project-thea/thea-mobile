import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearToken } from '../../store';

export default function MainScreen() {
  const dispatch = useDispatch();

  const handleSignOut = () => {
    dispatch(clearToken());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the App!</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
  });
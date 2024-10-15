import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Toast from 'react-native-toast-message';

import Divider from '@/components/Divider';
import { setToken } from '../../store';
import { useBaseUrl } from '@/hooks/useBaseUrl';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [emailMissing, setEmailMissing] = useState(false);
  const [passwordMissing, setPasswordMissing] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const baseUrl = useBaseUrl();

  const handleLogin = async () => {
    if(!email ){
      setEmailMissing(true);
      if(!password){ setPasswordMissing(true); }
      return;
    }

    if(!password){
      setPasswordMissing(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        dispatch(setToken(data.access));
        router.replace('/(app)/home');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Check your credentials and try again!',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'An error occurred, please try again!',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  const navigateToRegister = () => {
   router.replace('/(auth)/register');
  };

  useEffect(() => {
    if (email) { setEmailMissing(false); }
    if (password) { setPasswordMissing(false); }
  }, [password, email]);

  const createAnonymousUser = async () => {
    let name = uuidv4().toString().slice(0,8);
    let password = name
    const email = `${name}@anonymous.com`;
    
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setToken(data.access));
        router.replace('/(app)/home');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'An error occurred, please try again!',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('could not create anonymous user', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'An error occurred, please try again!',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
      setEmail('');
      setPassword('');
    }

  }


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailMissing && <Text style={styles.missingField}>Please provide a valid email address!</Text>}
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {passwordMissing && <Text style={styles.missingField}>Please provide a password!</Text>}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerText}>
                Don't have an account? Register here
              </Text>
            </TouchableOpacity>

          <Divider />

          <TouchableOpacity onPress={createAnonymousUser}>
            <Text style={styles.registerText}>
              Use as anonymous user
            </Text>
          </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  missingField: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 15,
    width: '100%',
  }
});

export default LoginScreen;
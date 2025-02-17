import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  ScrollView,
  Keyboard,
  Alert
} from 'react-native';
import Toast from 'react-native-toast-message';

import { userApi } from '@/services/api';
import { useRealm } from '@realm/react';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emptyFieldExists, setEmptyFieldExists] = useState(false)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [nameMissing, setNameMissing] = useState(false)
  const [emailMissing, setEmailMissing] = useState(false)
  const [passwordMissing, setPasswordMissing] = useState(false)
  const [confirmPasswordMissing, setConfirmPasswordMissing] = useState(false)

  const router = useRouter();
  const realm = useRealm()

  useEffect(() => {
    if(name) setNameMissing(false)

    if(email){
      if(!emailRegex.test(email)){ setEmailMissing(true) }
      else { setEmailMissing(false) }
      
    }

    if(password) setPasswordMissing(false)
    if(confirmPassword) setConfirmPasswordMissing(false)
  }, [name, email, password]);

  const handleRegister = async () => {
    if(!name || !email || !password){
      setEmptyFieldExists(true)
    } else {
      setEmptyFieldExists(false)
    }

    if(!name)setNameMissing(true)
    if (!email) setEmailMissing(true)
    if (!password) setPasswordMissing(true)
    
    if (emptyFieldExists) return;    

    if(!emailRegex.test(email)){ return}

    if(!confirmPassword || password !== confirmPassword){
      setConfirmPasswordMissing(true)
      return;
    } else {
      setConfirmPasswordMissing(false)
    }

    setIsLoading(true);

    try {
      const response = await userApi.register({name, email, password})

      realm.write(() => {
        realm.create('Subject', {
          subjectId: response.data.subject.id,
          isSignedIn: true,
          access: response.data.access,
          refresh: response.data.refresh
        });
      });

      router.replace('/home');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'An error occurred, please try again!',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setEmailMissing(false)
    }

  };

  const navigateToLogin = () => {
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.inner}>
          <Text style={styles.title}>Register</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {nameMissing && <Text style={styles.missingField}>Please provide a name!</Text>}
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
            autoCapitalize='none'
          />
          {passwordMissing && <Text style={styles.missingField}>Please provide a password!</Text>}
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize='none'
          />
          {confirmPasswordMissing && <Text style={styles.missingField}>This should match the password above!</Text>}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginText}>
              Already have an account? Login here
            </Text>
          </TouchableOpacity>

        </View>
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
  loginText: {
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

export default RegisterScreen;
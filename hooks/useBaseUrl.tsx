import React, { createContext, useContext, ReactNode } from 'react';
import Constants from 'expo-constants';

const BaseUrlContext = createContext(undefined);

export const BaseUrlProvider = ({ children }) => {
  const baseUrl = __DEV__
    // ? 'http://10.0.2.2:8000'
    ? 'http://192.168.250.198:8000' // fix: using my device IP to test on physical device
    : 'https://api.project-thea.org';

  return (
    <BaseUrlContext.Provider value={{ baseUrl }}>
      {children}
    </BaseUrlContext.Provider>
  );
};

export const useBaseUrl = (): string => {
  const context = useContext(BaseUrlContext);
  if (context === undefined) {
    throw new Error('useBaseUrl must be used within an BaseUrlProvider');
  }
  return context.baseUrl;
};
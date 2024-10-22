import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationResponse, LocationResponseState } from '@/locations';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null as string | null,
    isSignedIn: false,
    userId: null as string | null,
  },
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isSignedIn = true;
    },
    clearToken: (state) => {
      state.token = null;
      state.isSignedIn = false;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    clearUserId: (state) => {
      state.userId = null;
    }
  },
});

const initialState: LocationResponseState = {
  locations: [],
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    addLocation: (state, action: PayloadAction<LocationResponse>) => {
      state.locations.push(action.payload);
    },
    deleteLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter((location) => location.id !== action.payload);
    },
  },
});

// TODO; Add a selector to get all unsynced locations

// Export actions
export const { setToken, clearToken, setUserId, clearUserId } = authSlice.actions;
export const { addLocation, deleteLocation } = locationSlice.actions;

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'location'],
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);
const persistedLocationsReducer = persistReducer(persistConfig, locationSlice.reducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    location: persistedLocationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
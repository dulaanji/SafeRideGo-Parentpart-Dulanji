import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './src/AuthContext';
import { loadToken, setToken } from './src/api';
import { C } from './src/ui';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Verify from './src/screens/Verify';
import Home from './src/screens/Home';
import History from './src/screens/History';
import Alerts from './src/screens/Alerts';
import Profile from './src/screens/Profile';
import JourneyDetails from './src/screens/JourneyDetails';
import LiveMap from './src/screens/LiveMap';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const icons = { Trips: 'file-tray-outline', History: 'time-outline', Alerts: 'notifications-outline', Profile: 'person-outline' };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.navy,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.line, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size - 2} color={color} />,
      })}
    >
      <Tab.Screen name="Trips" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Alerts" component={Alerts} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    loadToken().then((t) => { setAuthed(!!t); setReady(true); });
  }, []);

  const auth = useMemo(() => ({
    signIn: async (token) => { await setToken(token); setAuthed(true); },
    signOut: async () => { await setToken(null); setAuthed(false); },
  }), []);

  // In Chrome the app is shown inside a phone-width column
  const frame = Platform.OS === 'web'
    ? { flex: 1, backgroundColor: C.page, alignItems: 'center' }
    : { flex: 1 };
  const inner = Platform.OS === 'web'
    ? { flex: 1, width: '100%', maxWidth: 430, backgroundColor: C.bg, overflow: 'hidden' }
    : { flex: 1 };

  return (
    <View style={frame}>
      <View style={inner}>
        {!ready ? (
          <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={C.amber} /></View>
        ) : (
          <SafeAreaProvider>
            <AuthContext.Provider value={auth}>
              <NavigationContainer>
                <StatusBar style="dark" />
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {authed ? (
                    <>
                      <Stack.Screen name="Main" component={Tabs} />
                      <Stack.Screen name="JourneyDetails" component={JourneyDetails} />
                      <Stack.Screen name="LiveMap" component={LiveMap} />
                    </>
                  ) : (
                    <>
                      <Stack.Screen name="Login" component={Login} />
                      <Stack.Screen name="Register" component={Register} />
                      <Stack.Screen name="Verify" component={Verify} />
                    </>
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </AuthContext.Provider>
          </SafeAreaProvider>
        )}
      </View>
    </View>
  );
}

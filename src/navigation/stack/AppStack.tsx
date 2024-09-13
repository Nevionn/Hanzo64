import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MainPageScreen from '../screens/MainPageScreen';
import RegistrationPageScreen from '../screens/RegistrationPageScreen';
import LoginPageScreen from '../screens/LoginPageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainScreen = () => (
  <Tab.Navigator
    tabBar={() => null}
    screenOptions={{
      headerShown: false,
    }}>
    <Tab.Screen name="LoginPage" component={RegistrationPageScreen} />
    <Tab.Screen name="MainPage" component={MainPageScreen} />
  </Tab.Navigator>
);

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {/* <Stack.Screen name="MainScreen" component={MainScreen} /> */}

      <Stack.Screen
        name="RegistrationPage"
        component={RegistrationPageScreen}
      />
      <Stack.Screen name="LoginPage" component={LoginPageScreen} />
      <Stack.Screen name="MainPage" component={MainPageScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import SplashScreen from './Screens/SplashScreen';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import CustomerDashboard from './Screens/CustomerDashboard';
import ShopkeeperDashboard from './Screens/ShopkeeperDashboard';
import ProductCatalog from './Screens/ProductCatalog';
import CreditRecords from './Screens/CreditRecords';
import CreateOrder from './Screens/CreateOrder';
import Reminders from './Screens/Reminders';
import OrderHistory from './Screens/OrderHistory';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CustomerDashboard"
          component={CustomerDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShopkeeperDashboard"
          component={ShopkeeperDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductCatalog"
          component={ProductCatalog}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreditRecords"
          component={CreditRecords}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateOrder"
          component={CreateOrder}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reminders"
          component={Reminders}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

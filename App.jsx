import { View, StyleSheet, SafeAreaView } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme, ThemedText } from './src/hooks/ThemeContext'
import HomeContainer from './src/screens/Home';
import NavBar from './src/components/navbar/NavBar';
import MenuBar from './src/components/navbar/MenuBar';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import { createTables } from './src/utils/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Monthly from './src/screens/Monthly';
import Yearly from './src/screens/Yearly';
import Charts from './src/screens/Charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from './src/screens/Profile';
import Search from './src/screens/Search';

const Tab = createBottomTabNavigator();

const App = () => {

  useEffect(() => {
    createTables();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <NavBar setMenuOpen={setMenuOpen} isMenuOpen={isMenuOpen} />
      <NavigationContainer>
        {/* <MenuBar setMenuOpen={setMenuOpen} isMenuOpen={isMenuOpen} /> */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Monthly') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Yearly') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Charts') {
                iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Search') {
                iconName = focused ? 'search' : 'search-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.focusedTabIconColor,
            tabBarInactiveTintColor: theme.textColor,
            tabBarStyle: {
              backgroundColor: theme.backgroundColor,
              borderTopColor: theme.borderColor,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={HomeContainer} />
          <Tab.Screen name="Monthly" component={Monthly} />
          <Tab.Screen name="Yearly" component={Yearly} />
          <Tab.Screen name="Charts" component={Charts} />
          <Tab.Screen name="Search" component={Search} />
          <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App
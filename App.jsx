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
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Monthly from './src/screens/Monthly';
import Yearly from './src/screens/Yearly';
import Charts from './src/screens/Charts';

const Stack = createStackNavigator();

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
        <MenuBar setMenuOpen={setMenuOpen} isMenuOpen={isMenuOpen} />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeContainer} options={{ headerShown: false }} />
          <Stack.Screen name="Monthly" component={Monthly} options={{ headerShown: false }} />
          <Stack.Screen name="Yearly" component={Yearly} options={{ headerShown: false }} />
          <Stack.Screen name="Charts" component={Charts} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App
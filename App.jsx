import { View, StyleSheet, Button, SafeAreaView } from 'react-native'
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

const Stack = createStackNavigator();

const App = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    createTables();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <AppContent isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

const AppContent = ({ isMenuOpen, setMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor, // Ensure the background color is applied
      backgroundColor: 'black', // Ensure the background color is applied
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <NavBar setMenuOpen={setMenuOpen} isMenuOpen={isMenuOpen} />
      <NavigationContainer>
        <MenuBar isMenuOpen={isMenuOpen} />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeContainer} options={{ headerShown: false }} />
          <Stack.Screen name="Monthly" component={Monthly} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App
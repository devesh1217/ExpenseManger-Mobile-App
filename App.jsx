import { View, StyleSheet, Button, SafeAreaView } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme, ThemedText } from './components/ThemeContext'
import HomeContainer from './components/home/HomeContainer';
import NavBar from './components/navbar/NavBar';
import MenuBar from './components/navbar/MenuBar';
import store from './contexts/store';
import { Provider } from 'react-redux';
import { createTables } from './contexts/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
      width: '100%',
      height: '100%',
      flex: 1,
      backgroundColor: theme.backgroundColor,
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <NavBar setMenuOpen={setMenuOpen} isMenuOpen={isMenuOpen} />
      <MenuBar isMenuOpen={isMenuOpen} />
      <HomeContainer />
    </SafeAreaView>
  );
};

export default App
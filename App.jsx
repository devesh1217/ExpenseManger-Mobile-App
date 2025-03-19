import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { ThemeProvider, useTheme } from './components/ThemeContext'

const ThemedContent = () => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgroundColor,
    },
    text: {
      color: theme.textColor,
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ThemedContent />
    </ThemeProvider>
  )
}

export default App
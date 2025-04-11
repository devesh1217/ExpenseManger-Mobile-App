import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";

const themes = {
    light: {
        backgroundColor: "#eee",
        color: "#000000",
        cardBackground: "#fff",
        textColor: "#000",
        borderColor: "#ddd",
        summaryBackground: "#fff",
        headerBackground: "#f5f5f5",
        modalBackground: "#fff",
        selectedItemBackground: "#e0e0e0",
        appThemeColor: '#056655',
        focusedTabIconColor: '#056655'
    },
    dark: {
        backgroundColor: "#121212",
        color: "#ffffff",
        cardBackground: "#1E1E1E",
        textColor: "#fff",
        borderColor: "#333",
        summaryBackground: "#1E1E1E",
        headerBackground: "#1E1E1E",
        modalBackground: "#1E1E1E",
        selectedItemBackground: "#333",
        appThemeColor: '#056655',
        focusedTabIconColor: '#058877'
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultAccount }) => {
    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState(themes[colorScheme] || themes.light);

    useEffect(() => {
        console.log('System theme changed to:', colorScheme);
        // Ensure the theme state is updated correctly
        if (colorScheme === 'dark' || colorScheme === 'light') {
            setTheme(themes[colorScheme]);
        }
    }, [colorScheme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === themes.light ? themes.dark : themes.light));
    };

    // Add defaultAccount to the context value
    const value = {
        theme,
        toggleTheme,
        defaultAccount
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemedText = ({ style, children, ...props }) => {
    const { theme } = useTheme();
    return (
        <ThemedText style={[{ color: theme.textColor }, style]} {...props}>
            {children}
        </ThemedText>
    );
};

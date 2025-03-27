import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";

const themes = {
    light: {
        backgroundColor: "#eee",
        color: "#000000",
        __bg: '#056655',
    },
    dark: {
        backgroundColor: "#000",
        color: "#ffffff",
        __bg: '#056655',
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
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

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

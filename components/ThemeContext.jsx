import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";

const themes = {
    light: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
    },
    dark: {
        backgroundColor: "#000000",
        textColor: "#ffffff",
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState(themes[colorScheme] || themes.light);

    useEffect(() => {
        console.log('System theme changed to:', colorScheme);
        setTheme(themes[colorScheme] || themes.light);
    }, [colorScheme]);

    const toggleTheme = () => {
        setTheme(theme === themes.light ? themes.dark : themes.light);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

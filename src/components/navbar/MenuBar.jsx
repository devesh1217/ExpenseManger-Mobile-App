import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/ThemeContext';

const MenuBar = ({isMenuOpen, setMenuOpen}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const slideAnim = useRef(new Animated.Value(-200)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isMenuOpen ? 0 : -200,
            useNativeDriver: true,
            tension: 65,
            friction: 10
        }).start();
    }, [isMenuOpen]);

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.appThemeColor,
            width: '100%',
            position: 'absolute',
            top: 60,
            zIndex: 10,
            opacity: 0.95,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
            elevation: 5,
            transform: [{ translateY: slideAnim }],
            display: isMenuOpen ? 'flex' : 'none'
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.1)',
        },
        menuText: {
            color: 'white',
            fontSize: 16,
            marginLeft: 15,
        }
    });

    const MenuItem = ({ icon, label, screen }) => (
        <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
                navigation.navigate(screen);
                setMenuOpen(false);
            }}
        >
            <Icon name={icon} size={20} color="white" />
            <Text style={styles.menuText}>{label}</Text>
        </TouchableOpacity>
    );

    if (!isMenuOpen) return null;

    return (
        <Animated.View style={styles.container}>
            <MenuItem icon="home" label="Home" screen="Home" />
            <MenuItem icon="calendar" label="Monthly" screen="Monthly" />
            <MenuItem icon="stats-chart" label="Yearly" screen="Yearly" />
            <MenuItem icon="pie-chart" label="Charts" screen="Charts" />
            <MenuItem icon="person" label="Profile" screen="Profile" />
        </Animated.View>
    );
};

export default MenuBar
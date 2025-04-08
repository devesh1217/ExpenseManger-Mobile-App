import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const NavBar = ({ setMenuOpen, isMenuOpen }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [showMenu, setShowMenu] = useState(false);

    const styles = StyleSheet.create({
        container: {
            position: 'relative',
            zIndex: 1000, // Add container with high zIndex
        },
        navbar: {
            backgroundColor: theme.appThemeColor,
            width: '100%',
            paddingVertical: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        title: {
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
        },
        menuButton: {
            padding: 8,
        },
        dropdown: {
            position: 'absolute',
            right: 16,
            top: '100%', // Position below navbar
            backgroundColor: theme.cardBackground,
            borderRadius: 8,
            elevation: 5,
            minWidth: 150,
            zIndex: 1000,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        menuText: {
            color: theme.color,
            marginLeft: 8,
            fontSize: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.navbar}>
                <Text style={styles.title}>MyExpenseManager</Text>
                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => setShowMenu(!showMenu)}
                >
                    <Icon name="ellipsis-vertical" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {showMenu && (
                <View style={styles.dropdown}>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => {
                            setShowMenu(false);
                            navigation.navigate('Setting');
                        }}
                    >
                        <Icon name="settings-outline" size={20} color={theme.color} />
                        <Text style={styles.menuText}>Settings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => {
                            setShowMenu(false);
                            navigation.navigate('Export');
                        }}
                    >
                        <Icon name="download-outline" size={20} color={theme.color} />
                        <Text style={styles.menuText}>Export Data</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => {
                            setShowMenu(false);
                            navigation.navigate('About');
                        }}
                    >
                        <Icon name="information-circle-outline" size={20} color={theme.color} />
                        <Text style={styles.menuText}>About Us</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default NavBar;
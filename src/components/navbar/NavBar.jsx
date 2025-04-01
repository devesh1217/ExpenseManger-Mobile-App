import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTheme } from '../../hooks/ThemeContext'
import Icon from 'react-native-vector-icons/Ionicons';

const NavBar = ({ setMenuOpen, isMenuOpen }) => {
    const {theme} = useTheme();
    const styles = StyleSheet.create({
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
            padding: 5,
        }
    });

    return (
        <View style={styles.navbar}>
            <Text style={styles.title}>MyExpenseManager</Text>
            {/* <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setMenuOpen(prev => !prev)}
            >
                <Icon 
                    name={isMenuOpen ? 'close' : 'menu'} 
                    size={24} 
                    color="white" 
                />
            </TouchableOpacity> */}
        </View>
    );
}

export default NavBar
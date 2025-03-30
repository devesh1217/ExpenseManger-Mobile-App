import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Alert } from 'react-native'
import React from 'react'
import { useTheme } from '../../hooks/ThemeContext'

const NavBar = ({ setMenuOpen, isMenuOpen }) => {
    const {theme} = useTheme();
    const styles = StyleSheet.create({
        navbar: {
            backgroundColor: theme.appThemeColor,
            width: '100%',
            height: '50',
            padding: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row'
        },
        textSize18: {
            fontSize: 18
        },
        textSize25: {
            fontSize: 25
        },
        textWhite: {
            color: 'white'
        }
    })
    return (
        <View style={[styles.navbar]} >
            <View>
                <Image source={''} />
                <Text style={[styles.textWhite, styles.textSize18]}>MyExpenseManager</Text>
            </View>
            <View>
                {/* <TouchableOpacity onPress={() => {Alert.alert("Hello","World!")}}>
                    <Text style={[styles.textWhite, styles.textSize25]}>=</Text>
                </TouchableOpacity> */}
                <Pressable onPress={() => { setMenuOpen(prev => !prev) }}>
                    <Text style={[styles.textWhite, styles.textSize25]}>
                        {isMenuOpen ? 'x' : '='}
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

export default NavBar
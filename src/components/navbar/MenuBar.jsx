import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';

const MenuBar = ({isMenuOpen, setMenuOpen}) => {
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        container: {
            backgroundColor: '#056655',
            opacity: 0.7,
            width: '100%',
            height: 'auto',
            padding: 10,
            alignItems: 'center',
            gap: 15,
            position: 'absolute',
            top: 50,
            zIndex: 10,
        },
        textWhite:{
            color: 'white'
        },
        hidden:{
            display: 'none'
        },
        open:{
            display: 'flex'
        }
    });
    return (
        <View style={[styles.container, isMenuOpen ? styles.open : styles.hidden]}>
            <TouchableOpacity onPress={() => {navigation.navigate('Home'); setMenuOpen(false);}}>
                <Text style={[styles.textWhite]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {navigation.navigate('Monthly'); setMenuOpen(false);}}>
                <Text style={[styles.textWhite]}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {navigation.navigate('Yearly'); setMenuOpen(false);}}>
                <Text style={[styles.textWhite]}>Yearly</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {navigation.navigate('Profile'); setMenuOpen(false);}}>
                <Text style={[styles.textWhite]}>Profile</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MenuBar
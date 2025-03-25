import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'

const MenuBar = ({isMenuOpen}) => {
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
            <Text style={[styles.textWhite]}>MenuBar</Text>
            <Text style={[styles.textWhite]}>MenuBar</Text>
            <Text style={[styles.textWhite]}>MenuBar</Text>
            <Text style={[styles.textWhite]}>MenuBar</Text>
        </View>
    )
}

export default MenuBar
import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '../../../hooks/ThemeContext'

const TransectionHeader = ({ total, isIncome }) => {
    const { theme } = useTheme();
    const styles = StyleSheet.create({
        container: {
            justifyContent: 'space-between',
            width: '100%',
            marginVertical: 8,
            backgroundColor: '#333',
            paddingVertical: 4,
            paddingHorizontal: 8
        },
        subContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        title: {
            fontSize: 18
        },
        amount: {
            color: isIncome ? '#2a2' : '#a22',
            fontSize: 18,
        },
    });
    return (
        <View style={[styles.container]}>
            <View style={[styles.subContainer]}>
                <Text style={[{ color: 'white' }, styles.title]}>{isIncome ? 'Income' : 'Expense'}</Text>
                <Text style={[{ color: 'white' }, styles.amount]}>{'₹ '+total}</Text>
            </View>
        </View>
    )
}

export default TransectionHeader
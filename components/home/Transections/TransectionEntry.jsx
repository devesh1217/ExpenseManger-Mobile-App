import { View, Text, StyleSheet } from 'react-native'
import React, { use } from 'react'
import { useTheme } from '../../ThemeContext'

const TransectionEntry = ({ entry, isIncome }) => {
    const { theme } = useTheme();
    const styles = StyleSheet.create({
        container: {
            justifyContent: 'space-between',
            width: '100%',
            gap: 2,
            marginVertical: 2,
            
            paddingVertical: 4,
            paddingHorizontal: 8,
        },
        subContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        title: {
            fontSize: 18
        },
        desc: {
            fontStyle: 'italic',
            color: '#777'
        },
        amount: {
            color: isIncome ? '#2a2' : '#a22',
            fontSize: 18,
        },
        account: {
            color: '#a72',
            fontStyle: 'italic'
        }
    });
    return (
        <View style={[styles.container]}>
            <View style={[styles.subContainer]}>
                <Text style={[{ color: theme.color }, styles.title]}>{entry.title}</Text>
                <Text style={[{ color: theme.color }, styles.amount]}>{entry.amount}</Text>
            </View>
            <View style={[styles.subContainer]}>
                <Text style={[{ color: theme.color }, styles.desc]}>{entry.desc}</Text>
                <Text style={[{ color: theme.color }, styles.account]}>{entry.account}</Text>
            </View>
        </View>
    )
}

export default TransectionEntry
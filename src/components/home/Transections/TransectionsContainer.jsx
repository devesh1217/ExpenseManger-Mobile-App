import { StyleSheet, View } from 'react-native'
import React from 'react'
import TransectionIncome from './TransectionIncome'
import TransectionExpense from './TransectionExpense'
import { useTheme } from '../../../hooks/ThemeContext'

const TransectionsContainer = () => {
    const { theme } = useTheme();
    const styles = StyleSheet.create({
        section: {
            backgroundColor: theme.cardBackground,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        parent:{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10'
        }
    });
    return (
        <View style={styles.parent}>
            <View style={styles.section}>
                <TransectionIncome />
            </View>
            <View style={styles.section}>
                <TransectionExpense />
            </View>
        </View>
    )
}

export default TransectionsContainer
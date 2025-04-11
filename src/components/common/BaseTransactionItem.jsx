import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/ThemeContext';

const BaseTransactionItem = ({ transaction, style }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            backgroundColor: theme.cardBackground,
            borderRadius: 10,
            marginBottom: 10,
        },
        content: {
            flex: 1,
            marginLeft: 15,
        },
        title: {
            fontSize: 16,
            color: theme.color,
            fontWeight: '500',
        },
        details: {
            fontSize: 14,
            color: theme.color + '80',
            marginTop: 4,
        },
        amount: {
            fontSize: 16,
            fontWeight: '600',
            color: transaction.type === 'income' ? '#4CAF50' : '#F44336',
        },
    });

    return (
        <View style={[styles.container, style]}>
            <Icon 
                name={transaction.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                size={24} 
                color={transaction.type === 'income' ? '#4CAF50' : '#F44336'} 
            />
            <View style={styles.content}>
                <Text style={styles.title}>{transaction.title}</Text>
                <Text style={styles.details}>
                    {transaction.account} • {transaction.category}
                </Text>
            </View>
            <Text style={styles.amount}>
                ₹{transaction.amount}
            </Text>
        </View>
    );
};

export default BaseTransactionItem;

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/ThemeContext';

const MonthlyTransactionEntry = ({ entry }) => {
    const navigation = useNavigation();
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
            color: entry.type === 'income' ? '#4CAF50' : '#F44336',
        },
    });

    return (
        <TouchableOpacity 
            onPress={() => navigation.navigate('Home', { targetDate: entry.date })}
        >
            <View style={styles.container}>
                <Icon 
                    name={entry.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                    size={24} 
                    color={entry.type === 'income' ? '#4CAF50' : '#F44336'} 
                />
                <View style={styles.content}>
                    <Text style={styles.title}>{entry.title}</Text>
                    <Text style={styles.details}>
                        {entry.account} • {entry.category}
                    </Text>
                </View>
                <Text style={styles.amount}>
                    ₹{entry.amount}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default MonthlyTransactionEntry;

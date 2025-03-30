import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '../../../hooks/ThemeContext'
import Icon from 'react-native-vector-icons/Ionicons';
import { categoryOptions } from '../../../constants/formOptions';

const TransectionEntry = ({ entry }) => {
    const { theme } = useTheme();

    const getCategoryIcon = (category, type) => {
        const options = type === 'income' ? categoryOptions.income : categoryOptions.expense;
        const categoryObj = options.find(cat => cat.value === category);
        return categoryObj?.icon || 'ellipsis-horizontal';
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        iconContainer: {
            backgroundColor: theme.appThemeColor,
            padding: 8,
            borderRadius: 20,
            marginRight: 12,
        },
        contentContainer: {
            flex: 1,
        },
        title: {
            color: theme.color,
            fontSize: 16,
            fontWeight: '500',
        },
        details: {
            color: theme.color + '80',
            fontSize: 14,
        },
        amount: {
            color: entry.type === 'income' ? '#4CAF50' : '#F44336',
            fontSize: 16,
            fontWeight: '500',
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon 
                    name={getCategoryIcon(entry.category, entry.type)} 
                    size={20} 
                    color="white" 
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.details}>{entry.category}</Text>
            </View>
            <Text style={styles.amount}>
                {entry.type === 'income' ? '+' : '-'}{entry.amount}
            </Text>
        </View>
    );
};

export default TransectionEntry;
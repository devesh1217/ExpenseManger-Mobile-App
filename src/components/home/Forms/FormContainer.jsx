import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React, { useState } from 'react';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import { useTheme } from '../../../hooks/ThemeContext';

const FormContainer = ({ onClose }) => {
    const [activeForm, setActiveForm] = useState('income');
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },
        tabContainer: {
            flexDirection: 'row',
            marginBottom: 10,
            paddingHorizontal: 15,
        },
        tab: {
            flex: 1,
            padding: 10,
            alignItems: 'center',
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: theme.appThemeColor,
        },
        tabText: {
            color: theme.color,
            fontSize: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeForm === 'income' && styles.activeTab]} 
                    onPress={() => setActiveForm('income')}
                >
                    <Text style={styles.tabText}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeForm === 'expense' && styles.activeTab]} 
                    onPress={() => setActiveForm('expense')}
                >
                    <Text style={styles.tabText}>Expense</Text>
                </TouchableOpacity>
            </View>
            {activeForm === 'income' ? 
                <IncomeForm onClose={onClose} /> : 
                <ExpenseForm onClose={onClose} />
            }
        </View>
    );
};

export default FormContainer;
import { View, Text, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../hooks/ThemeContext';
import TransectionEntry from './TransectionEntry';
import TransectionHeader from './TransectionHeader';
import { fetchTransactions } from '../../../../src/utils/database';
import { useDispatch, useSelector } from 'react-redux';
import { addDays } from 'date-fns';
import { setExpenses } from '../../../../src/redux/slices/transactionSlice';

const TransectionExpense = () => {
    const dispatch = useDispatch(); // Add useDispatch hook
    const expenses = useSelector((state) => state.transactions.expenses);
    const exTotal = useSelector(state => state.transactions.exTotal)
    const counter = useSelector((state) => state.date.value);

    useEffect(() => {
        const targetDate = addDays(new Date(), counter).toISOString().split('T')[0];
        fetchTransactions('expense', targetDate, (fetchedExpenses) => {
            dispatch(setExpenses(fetchedExpenses)); // Use dispatch to update Redux store
        });
    }, [counter]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            gap: 4,
            paddingVertical: 4,
            paddingHorizontal: 8,
            height: 'auto',
            minHeight: 150,
        }
    });

    return (
        <View style={[styles.container]}>
            <TransectionHeader isIncome={false} total={exTotal} />
            {expenses.length === 0 && <Text style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>No Expense Transections</Text>}
            {expenses.map((entry) => (
                <TransectionEntry entry={entry} key={entry.id} />
            ))}
        </View>
    );
};

export default TransectionExpense;
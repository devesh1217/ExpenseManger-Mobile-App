import { View, StyleSheet, Text } from 'react-native'
import React, { useEffect } from 'react'
import TransectionEntry from './TransectionEntry';
import TransectionHeader from './TransectionHeader';
import { fetchTransactions } from '../../../../src/utils/database';
import { useSelector, useDispatch } from 'react-redux';
import { addDays } from 'date-fns';
import { setIncomes } from '../../../../src/redux/slices/transactionSlice';

const TransectionIncome = () => {
    const incomes = useSelector((state) => state.transactions.incomes);
    const inTotal = useSelector(state => state.transactions.inTotal);
    const counter = useSelector((state) => state.date.value);
    const dispatch = useDispatch();

    useEffect(() => {
        const targetDate = addDays(new Date(), counter).toISOString().split('T')[0];
        fetchTransactions('income', targetDate, (fetchedIncomes) => {
            dispatch(setIncomes(fetchedIncomes));
        });
    }, [counter]);

    const styles = StyleSheet.create({
        container: {
            gap: 4,
            paddingVertical: 4,
            paddingHorizontal: 8,
            minHeight: 150,
        }
    });

    return (
        <View style={[styles.container]}>
            <TransectionHeader isIncome={true} total={inTotal} />
            {incomes.length === 0 && <Text style={{color: '#888', fontStyle: 'italic', textAlign: 'center'}}>No Income Transections</Text>}
            {incomes.map((entry) => (
                <TransectionEntry entry={entry} key={entry.id} />
            ))}
        </View>
    );
};

export default TransectionIncome;
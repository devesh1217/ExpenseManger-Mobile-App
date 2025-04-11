import { TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BaseTransactionItem from '../common/BaseTransactionItem';

const MonthlyTransactionItem = ({ transaction }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Home', { targetDate: transaction.date });
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <BaseTransactionItem transaction={transaction} />
        </TouchableOpacity>
    );
};

export default MonthlyTransactionItem;

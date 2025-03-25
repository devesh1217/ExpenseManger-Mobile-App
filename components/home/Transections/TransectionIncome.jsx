import { View, Text, FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '../../ThemeContext';
import TransectionEntry from './TransectionEntry';
import TransectionHeader from './TransectionHeader';

const TransectionIncome = () => {
    const arr = [
        { key:1, title: 'abc1', desc: 'sdf', amount: 11, account: 'Paytm' },
        { key:2, title: 'abc2', desc: 'sdf', amount: 12, account: 'Paytm' },
        { key:6, title: 'abc3', desc: 'sdf', amount: 13, account: 'Paytm' },
        { key:3, title: 'abc4', desc: 'sdf', amount: 14, account: 'Paytm' },
        { key:4, title: 'abc5', desc: 'sdf', amount: 15, account: 'Paytm' },
        { key:5, title: 'abc6', desc: 'sdf', amount: 16, account: 'Paytm' },
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            gap: 4,
            paddingVertical: 4,
            paddingHorizontal: 8,
            height: 'auto'
        }
    });

    return (
        <View style={[styles.container]}>
            <TransectionHeader isIncome={true} total={500} />
            {
                arr.map((entry) => (
                    <TransectionEntry entry={entry} isIncome={true} key={entry.key} />
                ))
            }
        </View>
    );
};

export default TransectionIncome;
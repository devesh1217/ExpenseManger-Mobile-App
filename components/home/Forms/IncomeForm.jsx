import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native';
import { insertTransaction } from '../../../contexts/database';
import { useTheme } from '../../ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { addIncome } from '../../../contexts/transactionSlice';

const IncomeForm = () => {
    const {theme } = useTheme();
    const styles = StyleSheet.create({
        form: {
            width: '100%',
            justifyContent: 'start',
            alignItems: 'center',
            padding: 15,
            gap: 10
        },
        text: {
            color: 'white',
            fontSize: 18
        },
        input: {
            width: '100%',
            borderBottomColor: '#056655',
            borderBottomWidth: 3,
            color: theme.color
        },
        textCenter: {
            textAlign: 'center'
        },
        btnWrapper: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignContent: 'center',
            borderRadius: 50,
            width: '100%',
            overflow: 'hidden'
        },
        btn: {
            backgroundColor: '#777',
            width: '50%',
            borderRadius: 30,
            padding: 5
        },
    });

    const [incomeForm, setIncomeForm] = useState({
        title: '',
        description: '',
        amount: 0,
        account: '',
        category: '',
        type: '',
    });

    const counter = useSelector((state) => state.date.value);
    const dispatch = useDispatch();

    const handleSubmit = () => {
        const transaction = {
            title: incomeForm.title,
            description: incomeForm.description,
            amount: parseFloat(incomeForm.amount),
            account: incomeForm.account,
            category: incomeForm.category,
            type: 'income',
        };
        insertTransaction(transaction, counter);
        dispatch(addIncome(transaction)); // Update Redux store
        alert('Income saved!');
    };

    return (
        <View style={[styles.form]}>
            <TextInput
                placeholder='Title'
                style={[styles.input]}
                value={incomeForm.title}
                onChangeText={(value) => setIncomeForm({ ...incomeForm, title: value })}
            />
            <TextInput
                placeholder='Description'
                style={[styles.input]}
                value={incomeForm.description}
                onChangeText={(value) => setIncomeForm({ ...incomeForm, description: value })}
            />
            <TextInput
                placeholder='Amount'
                style={[styles.input]}
                value={incomeForm.amount.toString()}
                keyboardType='numeric'
                onChangeText={(value) => setIncomeForm({ ...incomeForm, amount: value })}
            />
            <TextInput
                placeholder='Account'
                style={[styles.input]}
                value={incomeForm.account}
                onChangeText={(value) => setIncomeForm({ ...incomeForm, account: value })}
            />
            <TextInput
                placeholder='Category'
                style={[styles.input]}
                value={incomeForm.category}
                onChangeText={(value) => setIncomeForm({ ...incomeForm, category: value })}
            />
            <View style={[styles.btnWrapper]}>
                <Pressable style={[styles.btn]} onPress={handleSubmit}>
                    <Text style={[styles.text, styles.textCenter]} >Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default IncomeForm
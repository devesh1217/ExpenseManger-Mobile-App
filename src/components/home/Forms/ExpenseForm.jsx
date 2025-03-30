import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker';
import { accountOptions, categoryOptions } from '../../../constants/formOptions';
import React, { useState } from 'react'
import { StyleSheet } from 'react-native';
import { insertTransaction } from '../../../../src/utils/database';
import { useTheme } from '../../../hooks/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { addExpense } from '../../../../src/redux/slices/transactionSlice';

const ExpenseForm = ({ onClose }) => {
    const { theme } = useTheme();
    const counter = useSelector((state) => state.date.value);
    const dispatch = useDispatch();

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
        picker: {
            width: '100%',
            color: theme.color,
            backgroundColor: 'rgba(5, 102, 85, 0.1)',
            borderRadius: 5,
            marginVertical: 5,
        },
        pickerItem: {
            color: theme.color,
        },
    });

    const [expenseForm, setExpenseForm] = useState({
        title: '',
        description: '',
        amount: 0,
        account: '',
        category: '',
        sentTo: '',
    });

    const handleSubmit = () => {
        const transaction = {
            title: expenseForm.title,
            description: expenseForm.description,
            amount: parseFloat(expenseForm.amount),
            account: expenseForm.account,
            category: expenseForm.category,
            type: 'expense',
        };
        insertTransaction(transaction, counter);
        dispatch(addExpense(transaction)); // Update Redux store
        Alert.alert('Expense saved!');
        onClose?.();  // Call onClose after successful submission
    };

    const renderPickerItem = (item) => (
        <Picker.Item 
            key={item.value}
            label={item.label}
            value={item.value}
            style={styles.pickerItem}
        />
    );

    return (
        <View style={[styles.form]}>
            <TextInput
                placeholder='Title'
                style={[styles.input]}
                value={expenseForm.title}
                onChangeText={(value) => setExpenseForm({ ...expenseForm, title: value })}
            />
            <TextInput
                placeholder='Description'
                style={[styles.input]}
                value={expenseForm.description}
                onChangeText={(value) => setExpenseForm({ ...expenseForm, description: value })}
            />
            <TextInput
                placeholder='Amount'
                style={[styles.input]}
                value={expenseForm.amount.toString()}
                keyboardType='numeric'
                onChangeText={(value) => setExpenseForm({ ...expenseForm, amount: value })}
            />

            <Picker
                style={styles.picker}
                selectedValue={expenseForm.account}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, account: value })}
            >
                <Picker.Item label="Select Account" value="" />
                {accountOptions.map(renderPickerItem)}
            </Picker>

            <Picker
                style={styles.picker}
                selectedValue={expenseForm.category}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
            >
                <Picker.Item label="Select Category" value="" />
                {categoryOptions.expense.map(renderPickerItem)}
            </Picker>

            <TextInput
                placeholder='SentTo'
                style={[styles.input]}
                value={expenseForm.sentTo}
                onChangeText={(value) => setExpenseForm({ ...expenseForm, sentTo: value })} 
            />
            <View style={[styles.btnWrapper]}>
                <Pressable style={[styles.btn]} onPress={handleSubmit}>
                    <Text style={[styles.text, styles.textCenter]} >Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default ExpenseForm;
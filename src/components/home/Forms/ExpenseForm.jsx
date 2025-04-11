import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { accountOptions, categoryOptions } from '../../../constants/formOptions';
import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native';
import { insertTransaction } from '../../../../src/utils/database';
import { useTheme } from '../../../hooks/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { addExpense } from '../../../../src/redux/slices/transactionSlice';
import CustomPicker from '../../common/CustomPicker';
import { getAccounts, getCategories, getMostFrequentCategory } from '../../../../src/utils/database';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveFormState, loadFormState, clearFormState } from '../../../utils/formStorage';

const ExpenseForm = ({ onClose, navigation }) => {
    const { theme } = useTheme();
    const counter = useSelector((state) => state.date.value);
    const dispatch = useDispatch();
    const route = useRoute();

    // Move state initialization to top
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        description: '',
        amount: '',  // Change to string for proper state updates
        account: 'Cash',
        category: '',
        sentTo: '',
    });
    const [showAccountPicker, setShowAccountPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [customAccounts, setCustomAccounts] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);

    // Load saved form first, then load options
    useEffect(() => {
        const initForm = async () => {
            const savedForm = await loadFormState('expense');
            if (savedForm) {
                setExpenseForm(savedForm);
            }
            await loadCustomOptions();
        };
        initForm();
    }, []);

    // Save form changes with proper dependency
    useEffect(() => {
        if (expenseForm.title || expenseForm.description || expenseForm.amount || expenseForm.sentTo) {
            saveFormState('expense', expenseForm);
        }
    }, [expenseForm.title, expenseForm.description, expenseForm.amount, expenseForm.category, expenseForm.account, expenseForm.sentTo]);

    const loadCustomOptions = async () => {
        try {
            const [accounts, categories, mostFreqCategory] = await Promise.all([
                getAccounts(),
                getCategories(),
                getMostFrequentCategory('expense')
            ]);
            
            setCustomAccounts(accounts.map(acc => ({
                label: acc.name,
                value: acc.name,
                icon: acc.icon || 'wallet-outline'
            })));
            
            setCustomCategories(categories.expense.map(cat => ({
                label: cat.name,
                value: cat.name,
                icon: cat.icon || 'add-circle-outline'
            })));

            setExpenseForm(prev => ({
                ...prev,
                account: accounts.find(acc => acc.isDefault === 1)?.name || 'Cash',
                category: mostFreqCategory
            }));
        } catch (error) {
            console.error('Error loading options:', error);
        }
    };

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

        pickerContainer: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
        }
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
        dispatch(addExpense(transaction));
        
        clearFormState('expense');
        
        if (navigation) {
            navigation.navigate('Monthly', { reload: Date.now() });
            navigation.navigate('Yearly', { reload: Date.now() });
            navigation.navigate('Charts', { reload: Date.now() }); // Add Charts navigation
            navigation.navigate('Home');
        }
        
        Alert.alert('Expense saved!');
        onClose?.();
    };

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
            <View style={[styles.pickerContainer]} >

                <CustomPicker
                    value={expenseForm.account}
                    options={customAccounts}
                    onValueChange={(value) => setExpenseForm({ ...expenseForm, account: value })}
                    placeholder="Select Account"
                    visible={showAccountPicker}
                    setVisible={setShowAccountPicker}
                />

                <CustomPicker
                    value={expenseForm.category}
                    options={customCategories}
                    onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                    placeholder="Select Category"
                    visible={showCategoryPicker}
                    setVisible={setShowCategoryPicker}
                />

            </View>
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
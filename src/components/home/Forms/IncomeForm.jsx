import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native';
import { insertTransaction } from '../../../../src/utils/database';
import { useTheme } from '../../../hooks/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { addIncome } from '../../../../src/redux/slices/transactionSlice';
import CustomPicker from '../../common/CustomPicker';
import { getAccounts, getCategories, getMostFrequentCategory } from '../../../../src/utils/database';
import { useNavigation, useRoute } from '@react-navigation/native';

const IncomeForm = ({ onClose, navigation }) => {
    const { theme } = useTheme();
    const route = useRoute();

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
        pickerContainer:{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
        }
    });

    const [incomeForm, setIncomeForm] = useState({
        title: '',
        description: '',
        amount: 0,
        account: 'Cash',
        category: '',
        type: '',
    });

    const [showAccountPicker, setShowAccountPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [customAccounts, setCustomAccounts] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);

    useEffect(() => {
        loadCustomOptions();
    }, []);

    const loadCustomOptions = async () => {
        try {
            const [accounts, categories, mostFreqCategory] = await Promise.all([
                getAccounts(),
                getCategories(),
                getMostFrequentCategory('income')
            ]);
            
            setCustomAccounts(accounts.map(acc => ({
                label: acc.name,
                value: acc.name,
                icon: acc.icon || 'wallet-outline'
            })));
            
            setCustomCategories(categories.income.map(cat => ({
                label: cat.name,
                value: cat.name,
                icon: cat.icon || 'add-circle-outline'
            })));
            
            setIncomeForm(prev => ({
                ...prev,
                account: accounts.find(acc => acc.isDefault === 1)?.name || 'Cash',
                category: mostFreqCategory
            }));
        } catch (error) {
            console.error('Error loading options:', error);
        }
    };

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
        
        // Force reload of Monthly and Yearly screens
        if (navigation) {
            navigation.navigate('Monthly', { reload: Date.now() });
            navigation.navigate('Yearly', { reload: Date.now() });
            navigation.navigate('Charts', { reload: Date.now() }); // Add Charts navigation
            navigation.navigate('Home');
        }
        
        alert('Income saved!');
        onClose?.();
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
            <View style={[styles.pickerContainer]}>
                <CustomPicker
                    value={incomeForm.account}
                    options={customAccounts}
                    onValueChange={(value) => setIncomeForm({ ...incomeForm, account: value })}
                    placeholder="Select Account"
                    visible={showAccountPicker}
                    setVisible={setShowAccountPicker}
                />

                <CustomPicker
                    value={incomeForm.category}
                    options={customCategories}
                    onValueChange={(value) => setIncomeForm({ ...incomeForm, category: value })}
                    placeholder="Select Category"
                    visible={showCategoryPicker}
                    setVisible={setShowCategoryPicker}
                />
            </View>

            <View style={[styles.btnWrapper]}>
                <Pressable style={[styles.btn]} onPress={handleSubmit}>
                    <Text style={[styles.text, styles.textCenter]} >Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default IncomeForm
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAccounts, addCustomAccount, getCategories, addCustomCategory, getAccountBalance, updateDefaultAccount, getAllAccountBalances } from '../utils/database';

const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [newAccount, setNewAccount] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [categoryType, setCategoryType] = useState('income');
    const [balances, setBalances] = useState({});
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const fetchedAccounts = await getAccounts();
        const fetchedCategories = await getCategories();
        const allAccountBalances = await getAllAccountBalances();
        
        setAccounts(fetchedAccounts);
        setCategories(fetchedCategories);
        setAllAccounts(allAccountBalances);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: theme.backgroundColor,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.color,
            marginBottom: 12,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 8,
            padding: 8,
            color: theme.color,
            marginBottom: 8,
        },
        addButton: {
            backgroundColor: theme.appThemeColor,
            padding: 8,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: '#fff',
        },
        item: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        itemText: {
            color: theme.color,
            fontSize: 16,
        },
        balance: {
            color: theme.color,
            fontSize: 14,
            opacity: 0.7,
        },
        themeToggle: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: theme.cardBackground,
            borderRadius: 8,
            marginBottom: 16,
        },
    });

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Theme</Text>
                <View style={styles.themeToggle}>
                    <Text style={styles.itemText}>Dark Mode</Text>
                    <Switch
                        value={theme.backgroundColor === '#121212'}
                        onValueChange={toggleTheme}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Accounts</Text>
                {allAccounts.map((account, index) => (
                    <View key={index} style={styles.item}>
                        <View>
                            <Text style={styles.itemText}>{account.name}</Text>
                            <Text style={styles.balance}>
                                Balance: ₹{account.balance || 0}
                            </Text>
                        </View>
                        {account.isCustom && (
                            <TouchableOpacity
                                onPress={() => updateDefaultAccount(account.name)}
                            >
                                <Icon 
                                    name={account.isDefault ? 'star' : 'star-outline'} 
                                    size={24} 
                                    color={account.isDefault ? theme.appThemeColor : theme.color}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accounts</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Add new account"
                    placeholderTextColor={theme.color + '80'}
                    value={newAccount}
                    onChangeText={setNewAccount}
                />
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={async () => {
                        if (newAccount) {
                            await addCustomAccount(newAccount);
                            setNewAccount('');
                            loadData();
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Add Account</Text>
                </TouchableOpacity>
                
                {accounts.map(account => (
                    <View key={account.id} style={styles.item}>
                        <View>
                            <Text style={styles.itemText}>{account.name}</Text>
                            <Text style={styles.balance}>
                                Balance: ₹{balances[account.name] || 0}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => updateDefaultAccount(account.name)}
                        >
                            <Icon 
                                name={account.isDefault ? 'star' : 'star-outline'} 
                                size={24} 
                                color={account.isDefault ? theme.appThemeColor : theme.color}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <TouchableOpacity
                        style={[styles.addButton, { flex: 1, marginRight: 8, backgroundColor: categoryType === 'income' ? theme.appThemeColor : theme.cardBackground }]}
                        onPress={() => setCategoryType('income')}
                    >
                        <Text style={styles.buttonText}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addButton, { flex: 1, backgroundColor: categoryType === 'expense' ? theme.appThemeColor : theme.cardBackground }]}
                        onPress={() => setCategoryType('expense')}
                    >
                        <Text style={styles.buttonText}>Expense</Text>
                    </TouchableOpacity>
                </View>
                
                <TextInput
                    style={styles.input}
                    placeholder="Add new category"
                    placeholderTextColor={theme.color + '80'}
                    value={newCategory}
                    onChangeText={setNewCategory}
                />
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={async () => {
                        if (newCategory) {
                            await addCustomCategory(newCategory, categoryType);
                            setNewCategory('');
                            loadData();
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Add Category</Text>
                </TouchableOpacity>

                {categories[categoryType].map(category => (
                    <View key={category.id} style={styles.item}>
                        <Text style={styles.itemText}>{category.name}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default Profile;

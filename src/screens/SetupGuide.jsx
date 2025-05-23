import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccounts, updateAccount, deleteAccount, addAccount, getCategories, addCategory } from '../utils/database';
import { accountIcons } from '../constants/iconOptions';
import { checkBackupExists, restoreFromBackup } from '../utils/backupUtils';

const SetupGuide = ({ navigation }) => {
    const { theme } = useTheme();
    const [step, setStep] = useState(1);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [loading, setLoading] = useState(true);
    const [newAccount, setNewAccount] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [categoryType, setCategoryType] = useState('income');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [currentEditingForm, setCurrentEditingForm] = useState(null);
    const [newAccountIcon, setNewAccountIcon] = useState('wallet-outline');
    const [newCategoryIcon, setNewCategoryIcon] = useState('add-circle-outline');
    const [hasBackup, setHasBackup] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    useEffect(() => {
        loadInitialData();
        checkForLocalBackup();
    }, []);

    const loadInitialData = async () => {
        try {
            const accounts = await getAccounts();
            const categories = await getCategories();
            setAccounts(accounts);
            setCategories(categories);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const checkForLocalBackup = async () => {
        try {
            const exists = await checkBackupExists();
            setHasBackup(exists);
        } catch (error) {
            console.error('Error checking backup:', error);
            setHasBackup(false);
        }
    };

    const handleRestore = async () => {
        try {
            await restoreFromBackup();
            Alert.alert(
                'Restore Successful',
                'Your data has been restored successfully.',
                [{ text: 'OK', onPress: () => navigation.replace('MainStack') }]
            );
        } catch (error) {
            Alert.alert('Restore Failed', 'Failed to restore data. Please continue with fresh setup.', [
                { text: 'OK', onPress: () => setHasBackup(false) }
            ]);
        }
    };

    const handleStartFresh = () => {
        setHasBackup(false);
    };

    const handleAccountBalanceUpdate = async (id, balance, name = null, icon = null) => {
        try {
            const account = accounts.find(a => a.id === id);
            await updateAccount(
                id, 
                name || account.name, 
                icon || account.icon, 
                parseFloat(balance) || 0
            );
            await loadInitialData();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update account');
        }
    };

    const handleAccountDelete = async (id) => {
        try {
            await deleteAccount(id);
            await loadInitialData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleIconSelect = (icon) => {
        if (currentEditingForm === 'account') {
            if (editingAccount) {
                // Update existing account's icon
                handleAccountBalanceUpdate(
                    editingAccount.id,
                    editingAccount.openingBalance,
                    editingAccount.name,
                    icon
                );
                setEditingAccount(null);
            } else {
                // For new account
                setNewAccountIcon(icon);
            }
        } else if (currentEditingForm === 'category') {
            setNewCategoryIcon(icon);
        }
        setShowIconPicker(false);
    };

    const handleAddAccount = async () => {
        if (newAccount.trim()) {
            try {
                await addAccount(newAccount, newAccountIcon, 0);
                setNewAccount('');
                setNewAccountIcon('wallet-outline');
                loadInitialData();
            } catch (error) {
                Alert.alert('Error', 'Failed to add account');
            }
        }
    };

    const handleAddCategory = async () => {
        if (newCategory.trim()) {
            try {
                await addCategory(newCategory, newCategoryIcon, categoryType);
                setNewCategory('');
                setNewCategoryIcon('add-circle-outline');
                loadInitialData();
            } catch (error) {
                Alert.alert('Error', 'Failed to add category');
            }
        }
    };

    const completeSetup = async () => {
        try {
            await AsyncStorage.setItem('setupComplete', 'true');
            navigation.replace('MainStack');  // Simply replace current screen with MainStack
        } catch (error) {
            console.error('Error saving setup state:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={[
                    styles.headerButton, 
                    { opacity: step > 1 ? 1 : 0.5 }
                ]}
                onPress={() => setStep(prev => prev - 1)}
                disabled={step === 1}
            >
                <Icon name="chevron-back" size={24} color={theme.color} />
                <Text style={[styles.headerButtonText, { color: theme.color }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.progressIndicator}>
                {[...Array(2)].map((_, index) => (
                    <View 
                        key={index}
                        style={[
                            styles.progressDot,
                            {
                                backgroundColor: index === step - 1 ? 
                                    theme.appThemeColor : theme.borderColor
                            }
                        ]}
                    />
                ))}
            </View>

            <TouchableOpacity 
                style={[
                    styles.headerButton,
                    { backgroundColor: theme.appThemeColor }
                ]}
                onPress={step === 2 ? completeSetup : () => setStep(prev => prev + 1)}
            >
                <Text style={styles.headerButtonText}>
                    {step === 2 ? 'Finish' : 'Next'}
                </Text>
                <Icon 
                    name={step === 2 ? "checkmark" : "chevron-forward"} 
                    size={24} 
                    color="white" 
                />
            </TouchableOpacity>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            elevation: 2,
        },
        headerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            borderRadius: 8,
        },
        headerButtonText: {
            fontSize: 16,
            marginHorizontal: 4,
            color: 'white',
        },
        progressIndicator: {
            flexDirection: 'row',
            gap: 8,
        },
        progressDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        stepTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: theme.color,
        },
        stepContainer: {
            marginBottom: 24,
        },
        card: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
        },
        accountRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        accountInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        accountName: {
            color: theme.color,
            fontSize: 16,
            marginLeft: 8,
        },
        input: {
            backgroundColor: theme.backgroundColor,
            borderRadius: 8,
            padding: 8,
            color: theme.color,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.borderColor,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24,
        },
        button: {
            backgroundColor: theme.appThemeColor,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 8,
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
        },
        addButton: {
            backgroundColor: theme.appThemeColor,
            padding: 8,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16,
        },
        note: {
            color: theme.color,
            fontSize: 14,
            marginTop: 16,
            fontStyle: 'italic',
        },
        iconSelector: {
            padding: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        iconItem: {
            flex: 1,
            aspectRatio: 1,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
        },
        selectedIcon: {
            backgroundColor: theme.appThemeColor + '20',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: theme.backgroundColor,
            borderRadius: 12,
            padding: 16,
            width: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.color,
        },
        choiceButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.borderColor,
        },
        choiceTextContainer: {
            marginLeft: 16,
            flex: 1,
        },
        choiceTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4,
        },
        choiceDescription: {
            fontSize: 14,
            color: 'white',
            opacity: 0.8,
        },
        text: {
            fontSize: 16,
            color: theme.color,
            textAlign: 'center',
            lineHeight: 24,
        },
    });

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        {accounts.map(account => (
                            <View key={account.id} style={styles.card}>
                                <View style={styles.accountRow}>
                                    <View style={styles.accountInfo}>
                                        <Icon name={account.icon} size={24} color={theme.color} />
                                        <TextInput
                                            style={[styles.accountName, { flex: 1 }]}
                                            value={account.name}
                                            onChangeText={(text) => 
                                                handleAccountBalanceUpdate(account.id, account.openingBalance, text, account.icon)
                                            }
                                            editable={!account.isPermanent}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setCurrentEditingForm('account');
                                            setEditingAccount(account);
                                            setShowIconPicker(true);
                                        }}
                                    >
                                        <Icon name="create-outline" size={24} color={theme.color} />
                                    </TouchableOpacity>
                                    {!account.isPermanent && (
                                        <TouchableOpacity onPress={() => handleAccountDelete(account.id)}>
                                            <Icon name="trash-outline" size={24} color="#EF5350" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Opening Balance"
                                    placeholderTextColor={theme.color + '80'}
                                    keyboardType="numeric"
                                    defaultValue={account.openingBalance?.toString()}
                                    onEndEditing={(e) => handleAccountBalanceUpdate(account.id, e.nativeEvent.text)}
                                />
                            </View>
                        ))}
                        <TextInput
                            style={styles.input}
                            placeholder="Add New Account"
                            placeholderTextColor={theme.color + '80'}
                            value={newAccount}
                            onChangeText={setNewAccount}
                        />
                        <TouchableOpacity
                            style={styles.iconSelector}
                            onPress={() => {
                                setCurrentEditingForm('account');
                                setShowIconPicker(true);
                            }}
                        >
                            <Icon name={newAccountIcon} size={24} color={theme.color} />
                            <Text style={[styles.accountName, { marginLeft: 8 }]}>Select Icon</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                            <Text style={styles.buttonText}>Add Account</Text>
                        </TouchableOpacity>
                        <Text style={styles.note}>You can add or edit accounts later in the Profile section.</Text>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { fontSize: 16 }]}>Income Categories</Text>
                        {categories.income.map(category => (
                            <View key={category.id} style={styles.card}>
                                <View style={styles.accountInfo}>
                                    <Icon name={category.icon} size={24} color={theme.color} />
                                    <Text style={styles.accountName}>{category.name}</Text>
                                </View>
                            </View>
                        ))}
                        <Text style={[styles.stepTitle, { fontSize: 16, marginTop: 16 }]}>Expense Categories</Text>
                        {categories.expense.map(category => (
                            <View key={category.id} style={styles.card}>
                                <View style={styles.accountInfo}>
                                    <Icon name={category.icon} size={24} color={theme.color} />
                                    <Text style={styles.accountName}>{category.name}</Text>
                                </View>
                            </View>
                        ))}
                        <TextInput
                            style={styles.input}
                            placeholder={`Add New ${categoryType === 'income' ? 'Income' : 'Expense'} Category`}
                            placeholderTextColor={theme.color + '80'}
                            value={newCategory}
                            onChangeText={setNewCategory}
                        />
                        <TouchableOpacity
                            style={styles.iconSelector}
                            onPress={() => {
                                setCurrentEditingForm('category');
                                setShowIconPicker(true);
                            }}
                        >
                            <Icon name={newCategoryIcon} size={24} color={theme.color} />
                            <Text style={[styles.accountName, { marginLeft: 8 }]}>Select Icon</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                            <Text style={styles.buttonText}>Add Category</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    { backgroundColor: categoryType === 'income' ? theme.appThemeColor : theme.cardBackground },
                                ]}
                                onPress={() => setCategoryType('income')}
                            >
                                <Text style={[styles.buttonText, { color: categoryType === 'income' ? 'white' : theme.color }]}>
                                    Income
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    { backgroundColor: categoryType === 'expense' ? theme.appThemeColor : theme.cardBackground },
                                ]}
                                onPress={() => setCategoryType('expense')}
                            >
                                <Text style={[styles.buttonText, { color: categoryType === 'expense' ? 'white' : theme.color }]}>
                                    Expense
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.note}>You can add or edit categories later in the Profile section.</Text>
                    </View>
                );
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.header}>Loading...</Text>
            </View>
        );
    }

    if (hasBackup) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Welcome to MyExpenseManager!</Text>
                <Text style={[styles.text, { marginBottom: 24 }]}>
                    A previous backup was found on your device. Would you like to restore your data or start fresh?
                </Text>
                
                <View style={[styles.section, { marginTop: 24 }]}>
                    <TouchableOpacity 
                        style={[styles.choiceButton, { backgroundColor: theme.appThemeColor }]}
                        onPress={handleRestore}
                    >
                        <Icon name="cloud-download" size={24} color="white" />
                        <View style={styles.choiceTextContainer}>
                            <Text style={styles.choiceTitle}>Restore Backup</Text>
                            <Text style={styles.choiceDescription}>
                                Restore your accounts, categories, and transactions from the backup
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.choiceButton, { backgroundColor: theme.cardBackground }]}
                        onPress={handleStartFresh}
                    >
                        <Icon name="add-circle" size={24} color={theme.color} />
                        <View style={styles.choiceTextContainer}>
                            <Text style={[styles.choiceTitle, { color: theme.color }]}>Start Fresh</Text>
                            <Text style={[styles.choiceDescription, { color: theme.color }]}>
                                Set up new accounts and categories from scratch
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                <Text style={[styles.stepTitle, { color: theme.color }]}>
                    {step === 1 ? 'Step 1: Configure Your Accounts' : 'Step 2: Review Categories'}
                </Text>
                <ScrollView>
                    {renderStep()}
                </ScrollView>
            </View>
            <Modal
                visible={showIconPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowIconPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Icon</Text>
                            <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                                <Icon name="close" size={24} color={theme.color} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={accountIcons}
                            numColumns={4}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.iconItem,
                                        ((currentEditingForm === 'account' && (editingAccount?.icon === item || newAccountIcon === item)) ||
                                        (currentEditingForm === 'category' && newCategoryIcon === item))
                                            ? styles.selectedIcon
                                            : null,
                                    ]}
                                    onPress={() => handleIconSelect(item)}
                                >
                                    <Icon name={item} size={32} color={theme.color} />
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SetupGuide;

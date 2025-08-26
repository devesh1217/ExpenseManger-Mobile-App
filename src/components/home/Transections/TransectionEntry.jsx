import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../../../hooks/ThemeContext'
import Icon from 'react-native-vector-icons/Ionicons';
import CustomPicker from '../../common/CustomPicker';
import { updateTransaction, deleteTransaction, getAccounts, getCategories } from '../../../utils/database';
import DateTimePicker from '@react-native-community/datetimepicker';

const TransectionEntry = ({ entry, onUpdate }) => {
    const { theme } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [editedEntry, setEditedEntry] = useState({
        ...entry,
        date: entry.date || new Date().toISOString().split('T')[0]
    });
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showAccountPicker, setShowAccountPicker] = useState(false);
    const [allAccounts, setAllAccounts] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState({
        income: [],
        expense: []
    });
    const [accountOptions, setAccountOption] = useState(accountOptions);

    useEffect(() => {
        const fetchCategories = async () => {
            const categories = await getCategories();
            setCategoryOptions({
                income: categories.income.map(cat => ({
                    label: cat.name,
                    value: cat.name,
                    icon: cat.icon || 'add-circle-outline'
                })),
                expense: categories.expense.map(cat => ({
                    label: cat.name,
                    value: cat.name,
                    icon: cat.icon || 'remove-circle-outline'
                }))
            });
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchAccounts = async () => {
            const accounts = await getAccounts();
            setAllAccounts(accounts.map(acc => ({
                label: acc.name,
                value: acc.name,
                icon: acc.icon || 'wallet-outline'
            })));
        };
        fetchAccounts();
    }, []);


    const getCategoryIcon = (category, type) => {
        const options = type === 'income' ? categoryOptions.income : categoryOptions.expense;
        const categoryObj = options.find(cat => cat.value === category);
        // Return default icons for custom categories
        if (!categoryObj) {
            return type === 'income' ? 'add-circle-outline' : 'remove-circle-outline';
        }
        return categoryObj?.icon || 'ellipsis-horizontal';
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        iconContainer: {
            backgroundColor: theme.appThemeColor,
            padding: 8,
            borderRadius: 20,
            marginRight: 12,
        },
        contentContainer: {
            flex: 1,
        },
        title: {
            color: theme.color,
            fontSize: 16,
            fontWeight: '500',
        },
        details: {
            color: theme.color + '80',
            fontSize: 14,
        },
        account: {
            color: theme.color + '80',
            fontSize: 14,
            fontStyle: 'italic',
            textAlign: 'right'
        },
        amount: {
            color: entry.type === 'income' ? '#4CAF50' : '#F44336',
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'right'
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: '90%',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            elevation: 5,
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
        formContainer: {
            gap: 16,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 8,
            padding: 12,
            color: theme.color,
        },
        description: {
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 8,
            padding: 12,
            color: theme.color,
            height: 80,
            textAlignVertical: 'top'
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
        },
        updateButton: {
            backgroundColor: theme.appThemeColor,
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginRight: 8,
        },
        deleteButton: {
            backgroundColor: '#F44336',
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginLeft: 8,
        },
        buttonText: {
            color: 'white',
            textAlign: 'center',
            fontSize: 16,
        },
    });

    const handleUpdate = async () => {
        try {
            await updateTransaction(editedEntry);
            onUpdate?.();
            setModalVisible(false);
            Alert.alert('Success', 'Transaction updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update transaction');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this transaction?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(entry.id);
                            onUpdate?.();
                            setModalVisible(false);
                            Alert.alert('Success', 'Transaction deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete transaction');
                        }
                    },
                },
            ]
        );
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setEditedEntry({ ...editedEntry, date: formattedDate });
        }
    };

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Icon
                            name={getCategoryIcon(entry.category, entry.type)}
                            size={20}
                            color="white"
                        />
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{entry.title}</Text>
                        <Text style={styles.details}>{entry.category}</Text>
                    </View>
                    <View>
                        <Text style={styles.amount}>
                            {entry.type === 'income' ? '+' : '-'}{entry.amount}
                        </Text>
                        <Text style={styles.account}>{entry.account}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Transection Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={theme.color} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                value={editedEntry.title}
                                onChangeText={(text) => setEditedEntry({ ...editedEntry, title: text })}
                                placeholder="Title"
                                placeholderTextColor={theme.color + '80'}
                            />

                            <TextInput
                                style={styles.description}
                                value={editedEntry.description}
                                onChangeText={(text) => setEditedEntry({ ...editedEntry, description: text })}
                                placeholder="Description"
                                placeholderTextColor={theme.color + '80'}
                                multiline
                                numberOfLines={4}
                            />

                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: theme.color }}>
                                    {editedEntry.date || 'Select Date'}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date(editedEntry.date)}
                                    mode="date"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}

                            <TextInput
                                style={styles.input}
                                value={editedEntry.amount.toString()}
                                onChangeText={(text) => setEditedEntry({ ...editedEntry, amount: text })}
                                keyboardType="numeric"
                                placeholder="Amount"
                                placeholderTextColor={theme.color + '80'}
                            />

                            <CustomPicker
                                value={editedEntry.account}
                                options={allAccounts}
                                onValueChange={(value) => setEditedEntry({ ...editedEntry, account: value })}
                                placeholder="Select Account"
                                visible={showAccountPicker}
                                setVisible={setShowAccountPicker}
                            />

                            <CustomPicker
                                value={editedEntry.category}
                                options={categoryOptions[entry.type]}
                                onValueChange={(value) => setEditedEntry({ ...editedEntry, category: value })}
                                placeholder="Select Category"
                                visible={showCategoryPicker}
                                setVisible={setShowCategoryPicker}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default TransectionEntry;
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fetchMonthlyTransactions } from '../utils/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../hooks/ThemeContext';


const Monthly = () => {
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [transactionsByDate, setTransactionsByDate] = useState({});
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [summary, setSummary] = useState({ income: 0, expense: 0 });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        datePickerRow: {
            flexDirection: 'row',
            margin: 16,
        },
        datePickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.cardBackground,
            padding: 12,
            borderRadius: 12,
            elevation: 2,
        },
        datePickerText: {
            color: theme.textColor,
            fontSize: 16,
            marginLeft: 8,
        },
        summaryContainer: {
            flexDirection: 'row',
            margin: 16,
            padding: 16,
            backgroundColor: theme.summaryBackground,
            borderRadius: 12,
            elevation: 2,
        },
        summaryItem: {
            flex: 1,
            alignItems: 'center',
        },
        summaryDivider: {
            width: 1,
            backgroundColor: '#333',
            marginHorizontal: 16,
        },
        summaryLabel: {
            color: theme.textColor,
            opacity: 0.6,
            fontSize: 14,
            marginBottom: 4,
        },
        summaryAmount: {
            color: '#66BB6A',
            fontSize: 20,
            fontWeight: 'bold',
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: 16,
        },
        dateGroup: {
            marginBottom: 16,
        },
        dateHeader: {
            color: theme.textColor,
            fontSize: 14,
            marginBottom: 8,
            opacity: 0.7,
        },
        transactionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            marginBottom: 8,
            borderRadius: 12,
            backgroundColor: theme.cardBackground,
        },
        transactionLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        transactionDetails: {
            marginLeft: 12,
        },
        transactionTitle: {
            color: theme.textColor,
            fontSize: 16,
            fontWeight: '500',
        },
        transactionCategory: {
            color: theme.textColor,
            opacity: 0.6,
            fontSize: 14,
            marginTop: 2,
        },
        transactionAmount: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        incomeText: {
            color: '#66BB6A',
        },
        expenseText: {
            color: '#EF5350',
        },
        incomeItem: {
            borderLeftWidth: 4,
            borderLeftColor: '#66BB6A',
        },
        expenseItem: {
            borderLeftWidth: 4,
            borderLeftColor: '#EF5350',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerContainer: {
            width: '80%',
            backgroundColor: theme.modalBackground,
            borderRadius: 12,
            overflow: 'hidden',
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            backgroundColor: theme.headerBackground,
        },
        pickerTitle: {
            color: theme.textColor,
            fontSize: 18,
            fontWeight: 'bold',
        },
        closeButton: {
            padding: 4,
        },
        pickerContent: {
            flexDirection: 'row',
            height: 300,
        },
        pickerColumn: {
            flex: 1,
            borderRightWidth: 1,
            borderRightColor: '#333',
        },
        pickerItem: {
            padding: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        selectedItem: {
            backgroundColor: theme.selectedItemBackground,
        },
        pickerItemText: {
            color: theme.textColor,
            fontSize: 16,
        },
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    useEffect(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

        const fetchData = async (year, month) => {
            let allTransactions = [];
            const dateString = `${year}-${month}-01`;
            const income = await new Promise(resolve => {
                fetchMonthlyTransactions('income', dateString, (data) => resolve(data));
            });
            const expense = await new Promise(resolve => {
                fetchMonthlyTransactions('expense', dateString, (data) => resolve(data));
            });

            allTransactions = [...income, ...expense];
            allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Group transactions by date
            const groupedTransactions = allTransactions.reduce((acc, transaction) => {
                const date = transaction.date;
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(transaction);
                return acc;
            }, {});

            setTransactionsByDate(groupedTransactions);
            setSummary(calculateSummary(allTransactions));
        };

        fetchData(year, month);

    }, [selectedDate]);

    const calculateSummary = (transactions) => {
        return transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.income += parseFloat(transaction.amount);
            } else {
                acc.expense += parseFloat(transaction.amount);
            }
            return acc;
        }, { income: 0, expense: 0 });
    };

    const formatAmount = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const renderMonthPicker = () => (
        <Modal
            visible={showMonthPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMonthPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.pickerContainer, { width: '60%' }]}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Month</Text>
                        <TouchableOpacity onPress={() => setShowMonthPicker(false)} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.textColor} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={months}
                        style={{ maxHeight: 400 }}
                        renderItem={({ item: month }) => (
                            <TouchableOpacity
                                style={[
                                    styles.pickerItem,
                                    selectedDate.getMonth() === months.indexOf(month) && styles.selectedItem
                                ]}
                                onPress={() => {
                                    const newDate = new Date(selectedDate);
                                    newDate.setMonth(months.indexOf(month));
                                    setSelectedDate(newDate);
                                    setShowMonthPicker(false);
                                }}
                            >
                                <Text style={styles.pickerItemText}>{month}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderYearPicker = () => (
        <Modal
            visible={showYearPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowYearPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.pickerContainer, { width: '50%' }]}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Year</Text>
                        <TouchableOpacity onPress={() => setShowYearPicker(false)} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.textColor} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={years}
                        style={{ maxHeight: 400 }}
                        renderItem={({ item: year }) => (
                            <TouchableOpacity
                                style={[
                                    styles.pickerItem,
                                    selectedDate.getFullYear() === year && styles.selectedItem
                                ]}
                                onPress={() => {
                                    const newDate = new Date(selectedDate);
                                    newDate.setFullYear(year);
                                    setSelectedDate(newDate);
                                    setShowYearPicker(false);
                                }}
                            >
                                <Text style={styles.pickerItemText}>{year}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.toString()}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.datePickerRow}>
                <TouchableOpacity
                    style={[styles.datePickerButton, { flex: 2, marginRight: 8 }]}
                    onPress={() => setShowMonthPicker(true)}
                >
                    <MaterialIcons name="calendar-today" size={24} color={theme.textColor} />
                    <Text style={styles.datePickerText}>
                        {selectedDate.toLocaleString('default', { month: 'long' })}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.datePickerButton, { flex: 1 }]}
                    onPress={() => setShowYearPicker(true)}
                >
                    <MaterialIcons name="date-range" size={24} color={theme.textColor} />
                    <Text style={styles.datePickerText}>
                        {selectedDate.getFullYear()}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderMonthPicker()}
            {renderYearPicker()}

            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={styles.summaryAmount}>{formatAmount(summary.income)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Expense</Text>
                    <Text style={[styles.summaryAmount, { color: '#EF5350' }]}>{formatAmount(summary.expense)}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                {Object.entries(transactionsByDate).map(([date, transactions]) => (
                    <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>{date}</Text>
                        {transactions.map((transaction) => (
                            <View
                                key={transaction.id}
                                style={[
                                    styles.transactionItem,
                                    transaction.type === 'income' ? styles.incomeItem : styles.expenseItem
                                ]}
                            >
                                <View style={styles.transactionLeft}>
                                    <MaterialIcons
                                        name={transaction.type === 'income' ? 'arrow-downward' : 'arrow-upward'}
                                        size={24}
                                        color={transaction.type === 'income' ? '#66BB6A' : '#EF5350'}
                                    />
                                    <View style={styles.transactionDetails}>
                                        <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                        <Text style={styles.transactionCategory}>{transaction.category}</Text>
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        styles.transactionAmount,
                                        transaction.type === 'income' ? styles.incomeText : styles.expenseText
                                    ]}
                                >
                                    {formatAmount(transaction.amount)}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Monthly;
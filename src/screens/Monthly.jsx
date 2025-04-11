import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fetchMonthlyTransactions } from '../utils/database';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../hooks/ThemeContext';
import CustomPicker from '../components/common/CustomPicker';
import TransectionEntry from '../components/home/Transections/TransectionEntry';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MonthlyTransactionEntry from '../components/monthly/MonthlyTransactionEntry';
import { BarChart } from 'react-native-gifted-charts';

const Monthly = ({ navigation, route }) => {
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(() => {
        if (route.params?.selectedDate) {
            const date = new Date(route.params.selectedDate);
            // Ensure valid date by checking if it's not NaN
            return isNaN(date.getTime()) ? new Date() : date;
        }
        return new Date();
    });
    const [transactionsByDate, setTransactionsByDate] = useState({});
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [summary, setSummary] = useState({ income: 0, expense: 0 });
    const [selectedPoint, setSelectedPoint] = useState(null);

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
        chartContainer: {
            margin: 16,
            padding: 16,
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            elevation: 3,
            overflow: 'hidden',
            paddingVertical: 32
        },
        legendContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            gap: 20,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 8,
        },
        legendText: {
            fontSize: 14,
        }
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    // Move fetchData outside useEffect to make it reusable
    const fetchData = async () => {
        try {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dateString = `${year}-${month}-01`;

            const [incomeTransactions, expenseTransactions] = await Promise.all([
                fetchMonthlyTransactions('income', dateString),
                fetchMonthlyTransactions('expense', dateString)
            ]);

            const allTransactions = [...incomeTransactions, ...expenseTransactions];
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            const groupedTransactions = allTransactions.reduce((acc, transaction) => {
                const date = transaction.date;
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(transaction);
                return acc;
            }, {});

            setTransactionsByDate(groupedTransactions);
            setSummary({
                income: incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
                expense: expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
            });
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };

    // Update useFocusEffect to handle both date changes and reload parameter
    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedDate) {
                const newDate = new Date(route.params.selectedDate);
                if (selectedDate.getTime() !== newDate.getTime()) {
                    setSelectedDate(newDate);
                }
            }
            // Always fetch data when screen is focused or reload parameter changes
            fetchData();
            
            return () => {
                // Cleanup if needed
            };
        }, [route.params?.selectedDate, route.params?.reload, selectedDate])
    );

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

    const monthOptions = months.map(month => ({
        label: month,
        value: months.indexOf(month),
        icon: 'calendar'
    }));

    const yearOptions = years.map(year => ({
        label: year.toString(),
        value: year,
        icon: 'calendar'
    }));

    const handleTransactionPress = (transaction) => {
        // Navigate to Home with the transaction date
        navigation.navigate('Home', { targetDate: transaction.date });
    };

    const prepareBarData = () => {
        const daysInMonth = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1, 
            0
        ).getDate();

        const barData = [];
        
        // Create bar data for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTransactions = transactionsByDate[dateStr] || [];
            
            const totals = dayTransactions.reduce((acc, t) => {
                const amount = parseFloat(t.amount);
                if (t.type === 'income') acc.income += amount;
                else acc.expense += amount;
                return acc;
            }, { income: 0, expense: 0 });

            // Add sequential bars for each day regardless of transactions
            barData.push({
                value: totals.income,
                label: i.toString(),
                frontColor: '#4CAF50',
                topLabelComponent: () => (
                    <Text style={{ 
                        color: theme.color, 
                        fontSize: 8, 
                        transform: [{ rotate: '0deg' }]
                    }}>
                        {i}
                    </Text>
                )
            });
            barData.push({
                value: totals.expense,
                frontColor: '#EF5350',
                spacing: 4
            });
        }
        
        return barData;
    };

    const renderTooltip = (item) => (
        <View style={{
            backgroundColor: theme.cardBackground,
            padding: 8,
            borderRadius: 4,
            elevation: 2,
        }}>
            <Text style={{ color: theme.color }}>
                Day {item.label}
            </Text>
            <Text style={{ 
                color: item.color, 
                fontWeight: '600'
            }}>
                ₹{item.value.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <ScrollView 
            style={[styles.container]}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.datePickerRow}>
                <View style={{ flex: 2, marginRight: 8 }}>
                    <CustomPicker
                        value={selectedDate.getMonth()}
                        options={monthOptions}
                        onValueChange={(month) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(month);
                            setSelectedDate(newDate);
                        }}
                        placeholder="Select Month"
                        visible={showMonthPicker}
                        setVisible={setShowMonthPicker}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <CustomPicker
                        value={selectedDate.getFullYear()}
                        options={yearOptions}
                        onValueChange={(year) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(year);
                            setSelectedDate(newDate);
                        }}
                        placeholder="Select Year"
                        visible={showYearPicker}
                        setVisible={setShowYearPicker}
                    />
                </View>
            </View>

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

            <View style={styles.chartContainer}>
                <BarChart
                    data={prepareBarData()}
                    barWidth={10}
                    spacing={4}
                    xAxisThickness={1}
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: theme.color }}
                    xAxisLabelTextStyle={{ color: theme.color }}
                    yAxisLabelPrefix='₹'
                    xAxisColor={theme.color}
                    yAxisColor={theme.color}
                    showYAxisIndices
                    showXAxisIndices
                    xAxisIndicesColor={theme.color}
                    yAxisIndicesColor={theme.color}
                    noOfSections={5}
                    maxValue={Math.max(
                        ...Object.values(transactionsByDate)
                            .flat()
                            .map(t => parseFloat(t.amount))
                    ) * 1.1}
                    height={250}
                    width={250}
                    yAxisLabelWidth={50}
                    showFractionalValues
                    showValuesAsTopLabel={false}
                    barBorderRadius={2}
                    isAnimated
                />
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={[styles.legendText, { color: theme.color }]}>Income</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#EF5350' }]} />
                        <Text style={[styles.legendText, { color: theme.color }]}>Expense</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                {Object.entries(transactionsByDate).map(([date, transactions]) => (
                    <View key={date} style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>{date}</Text>
                        {transactions.map((transaction) => (
                            <MonthlyTransactionEntry 
                                key={transaction.id} 
                                entry={transaction} 
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
        </ScrollView>
    );
};

export default Monthly;
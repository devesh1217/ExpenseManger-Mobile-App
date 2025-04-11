import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ScrollView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchMonthlyTransactions } from '../utils/database';
import CustomPicker from '../components/common/CustomPicker';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-gifted-charts';

const Yearly = ({ navigation, route }) => {
    const { theme } = useTheme();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedBar, setSelectedBar] = useState(null);

    const years = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchYearData = async () => {
        try {
            const monthlyTotals = await Promise.all(
                months.map(async (month, index) => {
                    const monthNum = String(index + 1).padStart(2, '0');
                    const dateString = `${selectedYear}-${monthNum}-01`;

                    const [incomeTransactions, expenseTransactions] = await Promise.all([
                        fetchMonthlyTransactions('income', dateString),
                        fetchMonthlyTransactions('expense', dateString)
                    ]);

                    const income = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const expense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

                    return {
                        month,
                        income,
                        expense,
                        balance: income - expense
                    };
                })
            );

            setMonthlyData(monthlyTotals);
        } catch (error) {
            console.error('Error fetching yearly data:', error);
        }
    };

    useEffect(() => {
        fetchYearData();
    }, [selectedYear]);

    // Add useFocusEffect for reloading data
    useFocusEffect(
        React.useCallback(() => {
            fetchYearData();
            return () => {};
        }, [selectedYear, route.params?.reload]) // Add reload parameter to dependencies
    );

    const yearOptions = years.map(year => ({
        label: year.toString(),
        value: year,
        icon: 'calendar'
    }));

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        header: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4,
        },
        yearSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.appThemeColor,
            padding: 10,
            borderRadius: 8,
        },
        yearText: {
            color: 'white',
            fontSize: 18,
            marginRight: 8,
        },
        monthCard: {
            margin: 8,
            padding: 16,
            backgroundColor: theme.cardBackground,
            borderRadius: 8,
            elevation: 2,
        },
        monthTitle: {
            color: theme.color,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 4,
        },
        label: {
            color: theme.color,
            opacity: 0.7,
        },
        income: {
            color: '#4CAF50',
            fontWeight: '500',
        },
        expense: {
            color: '#F44336',
            fontWeight: '500',
        },
        balance: {
            color: theme.color,
            fontWeight: 'bold',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerContainer: {
            width: '60%',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            overflow: 'hidden',
        },
        pickerHeader: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        pickerTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
        },
        yearOption: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        yearOptionText: {
            color: theme.color,
            fontSize: 16,
            textAlign: 'center',
        },
        selectedYear: {
            backgroundColor: theme.appThemeColor + '20',
        },
        summaryCard: {
            margin: 16,
            padding: 16,
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            elevation: 3,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        summaryTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
        },
        totalAmount: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.color,
            textAlign: 'right',
            marginTop: 8,
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 8,
        },
        monthBox: {
            width: '50%',
            padding: 8,
        },
        monthCard: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            elevation: 2,
        },
        monthHeader: {
            color: theme.color,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            paddingBottom: 8,
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
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 8,
        },
        legendDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 8,
        },
        legendText: {
            fontSize: 14,
        }
    });

    const yearTotal = monthlyData.reduce(
        (acc, month) => ({
            income: acc.income + month.income,
            expense: acc.expense + month.expense,
            balance: acc.balance + month.balance
        }),
        { income: 0, expense: 0, balance: 0 }
    );

    const prepareBarData = () => {
        if (!monthlyData.length) return [];
        
        const barData = [];
        monthlyData.forEach((month, index) => {
            // Add income bar
            barData.push({
                value: month.income,
                label: String(index + 1).padStart(2, '0'),
                frontColor: '#4CAF50',
                spacing: 2,
            });
            // Add expense bar right next to income
            barData.push({
                value: month.expense,
                frontColor: '#EF5350',
                spacing: 12,
            });
        });
        return barData;
    };

    const renderTooltip = (item, index) => {
        const isIncome = index % 2 === 0;
        const monthIndex = Math.floor(index / 2);
        return (
            <View style={{
                backgroundColor: theme.cardBackground,
                padding: 8,
                borderRadius: 4,
                elevation: 2,
                borderLeftWidth: 3,
                borderLeftColor: isIncome ? '#4CAF50' : '#EF5350'
            }}>
                <Text style={{ color: theme.color, fontSize: 12 }}>
                    {months[monthIndex]}
                </Text>
                <Text style={{ 
                    color: isIncome ? '#4CAF50' : '#EF5350',
                    fontWeight: '600'
                }}>
                    ₹{item.value.toFixed(2)}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView 
            style={[styles.container]}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={{ width: '50%' }}>
                    <CustomPicker
                        value={selectedYear}
                        options={yearOptions}
                        onValueChange={setSelectedYear}
                        placeholder="Select Year"
                        visible={showYearPicker}
                        setVisible={setShowYearPicker}
                    />
                </View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Year {selectedYear} Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Total Income</Text>
                    <Text style={styles.income}>+₹{yearTotal.income.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Total Expense</Text>
                    <Text style={styles.expense}>-₹{yearTotal.expense.toFixed(2)}</Text>
                </View>
                <Text style={styles.totalAmount}>₹{yearTotal.balance.toFixed(2)}</Text>
            </View>

            <View style={styles.chartContainer}>
                <BarChart
                    data={prepareBarData()}
                    barWidth={15}
                    spacing={2}
                    roundedTop
                    xAxisThickness={1}
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: theme.color }}
                    xAxisLabelTextStyle={{ color: theme.color }}
                    yAxisLabelPrefix='₹'
                    showYAxisIndices
                    showXAxisIndices
                    noOfSections={5}
                    xAxisColor={theme.color}
                    yAxisColor={theme.color}
                    xAxisIndicesColor={theme.color}
                    yAxisIndicesColor={theme.color}
                    maxValue={Math.max(...monthlyData.map(item => 
                        Math.max(item.income || 0, item.expense || 0)
                    )) * 1.1}
                    labelWidth={30}
                    height={250}
                    overflowTop={20}
                    width={250}
                    yAxisLabelWidth={50}
                    onPress={(item, index) => setSelectedBar(index)}
                    renderTooltip={renderTooltip}
                    activeOpacity={0.7}
                    focusBarOnPress={true}
                    isAnimated={true}

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

            <FlatList
                data={monthlyData}
                numColumns={2}
                keyExtractor={item => item.month}
                renderItem={({ item, index }) => (
                    <TouchableOpacity 
                        style={styles.monthBox}
                        onPress={() => {
                            const date = new Date(selectedYear, index, 1);
                            navigation.navigate('Monthly', { selectedDate: date });
                        }}
                    >
                        <View style={styles.monthCard}>
                            <Text style={styles.monthHeader}>{item.month}</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Income</Text>
                                <Text style={styles.income}>+₹{item.income.toFixed(2)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Expense</Text>
                                <Text style={styles.expense}>-₹{item.expense.toFixed(2)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Balance</Text>
                                <Text style={[
                                    styles.balance,
                                    { color: item.balance >= 0 ? '#4CAF50' : '#F44336' }
                                ]}>₹{item.balance.toFixed(2)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </ScrollView>
    );
};

export default Yearly;

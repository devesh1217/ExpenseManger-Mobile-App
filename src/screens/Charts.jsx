import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/ThemeContext';
import CustomPicker from '../components/common/CustomPicker';
import { fetchMonthlyTransactions, fetchTransactionsByCategory } from '../utils/database';
import { categoryOptions } from '../constants/formOptions';
import { PieChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'

const Charts = ({ navigation, route }) => {
    const { theme } = useTheme();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [monthlyData, setMonthlyData] = useState({ income: {}, expense: {} });
    const [yearlyData, setYearlyData] = useState({ income: {}, expense: {} });
    const [activeTab, setActiveTab] = useState('monthly');
    const [activeType, setActiveType] = useState('income');
    const [showTransactions, setShowTransactions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryTransactions, setCategoryTransactions] = useState([]);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - i
    );

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

    const fetchMonthData = async () => {
        try {
            const monthNum = String(selectedMonth + 1).padStart(2, '0');
            const dateString = `${selectedYear}-${monthNum}-01`;

            const [incomeTransactions, expenseTransactions] = await Promise.all([
                fetchMonthlyTransactions('income', dateString),
                fetchMonthlyTransactions('expense', dateString)
            ]);

            const processTransactions = (transactions) => {
                return transactions.reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
                    return acc;
                }, {});
            };

            setMonthlyData({
                income: processTransactions(incomeTransactions),
                expense: processTransactions(expenseTransactions)
            });
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        }
    };

    const fetchYearData = async () => {
        try {
            const yearIncome = {};
            const yearExpense = {};

            await Promise.all(months.map(async (_, month) => {
                const monthNum = String(month + 1).padStart(2, '0');
                const dateString = `${selectedYear}-${monthNum}-01`;

                const [incomeTransactions, expenseTransactions] = await Promise.all([
                    fetchMonthlyTransactions('income', dateString),
                    fetchMonthlyTransactions('expense', dateString)
                ]);

                incomeTransactions.forEach(t => {
                    yearIncome[t.category] = (yearIncome[t.category] || 0) + parseFloat(t.amount);
                });

                expenseTransactions.forEach(t => {
                    yearExpense[t.category] = (yearExpense[t.category] || 0) + parseFloat(t.amount);
                });
            }));

            setYearlyData({ income: yearIncome, expense: yearExpense });
        } catch (error) {
            console.error('Error fetching yearly data:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMonthData();
            fetchYearData();
            return () => { };
        }, [selectedMonth, selectedYear, route.params?.reload])
    );

    const getChartData = (data, type) => {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#4BC0C0', '#FFCE56'
        ];

        return Object.entries(data).map(([category, amount], index) => ({
            value: amount,
            label: category,
            color: colors[index % colors.length],
            labelTextStyle: { color: theme.color },
            legendLabel: `${category}: ₹${amount.toFixed(2)}`
        }));
    };

    const getLegendData = (data, type) => {
        const total = Object.values(data).reduce((sum, amount) => sum + amount, 0);
        return Object.entries(data).map(([category, amount], index) => ({
            category,
            amount,
            percentage: ((amount / total) * 100).toFixed(1)
        }));
    };

    const handleCategoryPress = async (category, type) => {
        try {
            const date = activeTab === 'monthly'
                ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
                : selectedYear.toString();

            const transactions = await fetchTransactionsByCategory(
                type,
                category,
                date,
                activeTab === 'monthly'
            );

            setSelectedCategory({ name: category, type });
            setCategoryTransactions(transactions);
            setShowTransactions(true);
        } catch (error) {
            console.error('Error fetching category transactions:', error);
        }
    };

    const handleTransactionPress = (date) => {
        setShowTransactions(false);
        navigation.navigate('Home', { targetDate: date });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        header: {
            padding: 16,
            backgroundColor: theme.cardBackground,
            elevation: 4,
        },
        section: {
            margin: 16,
            padding: 16,
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            elevation: 3,
        },
        sectionTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
        },
        categoryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        categoryText: {
            color: theme.color,
            fontSize: 16,
        },
        amountText: {
            fontSize: 16,
            fontWeight: '500',
        },
        incomeText: {
            color: '#4CAF50',
        },
        expenseText: {
            color: '#F44336',
        },
        pickerRow: {
            flexDirection: 'row',
            gap: 8,
        },
        tabContainer: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: theme.cardBackground,
            elevation: 4,
        },
        tab: {
            flex: 1,
            padding: 12,
            alignItems: 'center',
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: theme.appThemeColor,
        },
        tabText: {
            color: theme.color,
            fontSize: 16,
        },
        typeSwitch: {
            flexDirection: 'row',
            padding: 8,
            backgroundColor: theme.cardBackground,
            borderRadius: 8,
            margin: 16,
        },
        typeButton: {
            flex: 1,
            padding: 8,
            alignItems: 'center',
            borderRadius: 6,
        },
        activeType: {
            backgroundColor: theme.appThemeColor,
        },
        chartContainer: {
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.cardBackground,
            margin: 16,
            borderRadius: 12,
            elevation: 3,
        },
        legend: {
            marginTop: 20,
            width: '100%',
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            paddingHorizontal: 16,
        },
        legendColor: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 8,
        },
        legendText: {
            color: theme.color,
            fontSize: 14,
            flex: 1,
        },
        legendPercentage: {
            color: theme.color,
            fontSize: 14,
            marginLeft: 8,
        },
        chartTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        transactionModal: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            width: '90%',
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            paddingBottom: 8,
        },
        modalTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
        },
        transactionItem: {
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            paddingVertical: 12,
        },
        transactionTitle: {
            color: theme.color,
            fontSize: 16,
            fontWeight: '500',
        },
        transactionDetail: {
            color: theme.color,
            opacity: 0.7,
            fontSize: 14,
            marginTop: 4,
        },
    });

    const chartConfig = {
        backgroundGradientFrom: theme.cardBackground,
        backgroundGradientTo: theme.cardBackground,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    const renderCategoryData = (data, type) => {
        if (Object.keys(data).length === 0) {
            return <></>;
        }
        return (
            <View style={styles.section}>
                {
                    Object.entries(data).map(([category, amount]) => (
                        <TouchableOpacity
                            key={category}
                            style={styles.categoryRow}
                            onPress={() => handleCategoryPress(category, type)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                            <Text style={[
                                styles.amountText,
                                type === 'income' ? styles.incomeText : styles.expenseText
                            ]}>
                                ₹{amount.toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    ))
                }
            </View>
        );
    };

    const ChartWithLegend = ({ data, type }) => {
        const chartData = getChartData(data, type);
        const legendData = getLegendData(data, type);
        const total = Object.values(data).reduce((sum, amount) => sum + amount, 0);

        if (chartData.length === 0) {
            return (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>No data available</Text>
                </View>
            );
        }

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                    {activeType === 'income' ? 'Income' : 'Expense'} Distribution
                    {'\n'}Total: ₹{total.toFixed(2)}
                </Text>
                <PieChart
                    data={chartData}
                    donut
                    radius={120}
                    innerRadius={60}
                    innerCircleColor={theme.cardBackground}
                    centerLabelComponent={() => (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.categoryText, { textAlign: 'center' }]}>
                                {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
                            </Text>
                            <Text style={[styles.categoryText, { fontSize: 12 }]}>
                                ({activeTab === 'monthly' ? months[selectedMonth] : selectedYear})
                            </Text>
                        </View>
                    )}
                />
                <View style={styles.legend}>
                    {legendData.map((item, index) => (
                        <View key={item.category} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: chartData[index].color }]} />
                            <Text style={styles.legendText}>{item.category}</Text>
                            <Text style={styles.legendPercentage}>₹{item.amount.toFixed(2)}</Text>
                            <Text style={styles.legendPercentage}>({item.percentage}%)</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'monthly' && styles.activeTab]}
                    onPress={() => setActiveTab('monthly')}
                >
                    <Text style={styles.tabText}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'yearly' && styles.activeTab]}
                    onPress={() => setActiveTab('yearly')}
                >
                    <Text style={styles.tabText}>Yearly</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'monthly' ? (
                <>
                    <View style={styles.header}>
                        <View style={styles.pickerRow}>
                            <View style={{ flex: 2 }}>
                                <CustomPicker
                                    value={selectedMonth}
                                    options={monthOptions}
                                    onValueChange={setSelectedMonth}
                                    placeholder="Select Month"
                                    visible={showMonthPicker}
                                    setVisible={setShowMonthPicker}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
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
                    </View>

                    <View style={styles.typeSwitch}>
                        <TouchableOpacity
                            style={[styles.typeButton, activeType === 'income' && styles.activeType]}
                            onPress={() => setActiveType('income')}
                        >
                            <Text style={[styles.tabText, { color: activeType === 'income' ? '#fff' : theme.color }]}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, activeType === 'expense' && styles.activeType]}
                            onPress={() => setActiveType('expense')}
                        >
                            <Text style={[styles.tabText, { color: activeType !== 'income' ? '#fff' : theme.color }]}>Expense</Text>
                        </TouchableOpacity>
                    </View>

                    <ChartWithLegend data={monthlyData[activeType]} type={activeType} />

                    {renderCategoryData(monthlyData[activeType], activeType)}
                </>
            ) : (
                <>
                    <View style={styles.header}>
                        <CustomPicker
                            value={selectedYear}
                            options={yearOptions}
                            onValueChange={setSelectedYear}
                            placeholder="Select Year"
                            visible={showYearPicker}
                            setVisible={setShowYearPicker}
                        />
                    </View>

                    <View style={styles.typeSwitch}>
                        <TouchableOpacity
                            style={[styles.typeButton, activeType === 'income' && styles.activeType]}
                            onPress={() => setActiveType('income')}
                        >
                            <Text style={[styles.tabText, { color: activeType === 'income' ? '#fff' : theme.color }]}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, activeType === 'expense' && styles.activeType]}
                            onPress={() => setActiveType('expense')}
                        >
                            <Text style={[styles.tabText, { color: activeType !== 'income' ? '#fff' : theme.color }]}>Expense</Text>
                        </TouchableOpacity>
                    </View>

                    <ChartWithLegend data={yearlyData[activeType]} type={activeType} />

                    {renderCategoryData(yearlyData[activeType], activeType)}
                </>
            )}

            <Modal
                visible={showTransactions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowTransactions(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.transactionModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedCategory?.name} Transactions
                                {activeTab === 'monthly' && ` (${months[selectedMonth]} ${selectedYear})`}
                                {activeTab === 'yearly' && ` (${selectedYear})`}
                            </Text>
                            <TouchableOpacity onPress={() => setShowTransactions(false)}>
                                <Text style={{ color: theme.color }}>
                                    <Icon name="close" size={20} color={theme.color} />
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {categoryTransactions.map(transaction => (
                                <TouchableOpacity
                                    key={transaction.id}
                                    style={styles.transactionItem}
                                    onPress={() => handleTransactionPress(transaction.date)}
                                >
                                    <Text style={styles.transactionTitle}>
                                        {transaction.title} - ₹{transaction.amount}
                                    </Text>
                                    <Text style={styles.transactionDetail}>
                                        {transaction.date} • {transaction.account}
                                    </Text>
                                    {transaction.description && (
                                        <Text style={styles.transactionDetail}>
                                            {transaction.description}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default Charts;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomPicker from '../components/common/CustomPicker';
import { getAccounts, fetchTransactionsByFilters } from '../utils/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { exportAsCSV, exportAsPDF } from '../utils/exportUtils';

const Export = ({ navigation }) => {
    const { theme } = useTheme();
    const [filters, setFilters] = useState({
        type: 'all',
        startDate: null,
        endDate: null,
        account: '',
    });
    const [accounts, setAccounts] = useState([]);
    const [showAccountPicker, setShowAccountPicker] = useState(false);
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const fetchedAccounts = await getAccounts();
        setAccounts(fetchedAccounts.map(acc => ({
            label: acc.name,
            value: acc.name,
            icon: acc.icon || 'wallet-outline'
        })));
    };

    const handleExport = async (format) => {
        try {
            const transactions = await fetchTransactionsByFilters('', filters);
            
            if (transactions.length === 0) {
                Alert.alert('No Data', 'No transactions found for the selected filters.');
                return;
            }

            if (format === 'pdf') {
                await exportAsPDF(transactions);
                Alert.alert('Success', 'PDF exported successfully');
            } else {
                await exportAsCSV(transactions);
                Alert.alert('Success', 'CSV exported successfully');
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert(
                'Export Error', 
                'Failed to export transactions. Please check app permissions and try again.'
            );
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.color,
            marginLeft: 16,
        },
        content: {
            padding: 16,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            color: theme.color,
            marginBottom: 12,
        },
        filterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            gap: 8,
        },
        typeButton: {
            flex: 1,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: theme.cardBackground,
        },
        activeType: {
            backgroundColor: theme.appThemeColor,
        },
        buttonText: {
            color: theme.color,
            fontSize: 16,
        },
        exportButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.appThemeColor,
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
        },
        dateText: {
            color: theme.color,
            fontSize: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={theme.color} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Export Transactions</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transaction Type</Text>
                    <View style={styles.filterRow}>
                        {['all', 'income', 'expense'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    filters.type === type && styles.activeType
                                ]}
                                onPress={() => setFilters({ ...filters, type })}
                            >
                                <Text style={styles.buttonText}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date Range</Text>
                    <View style={styles.filterRow}>
                        <TouchableOpacity 
                            style={styles.typeButton}
                            onPress={() => setShowStartDate(true)}
                        >
                            <Text style={styles.dateText}>
                                {filters.startDate ? filters.startDate.toLocaleDateString() : 'Start Date'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.typeButton}
                            onPress={() => setShowEndDate(true)}
                        >
                            <Text style={styles.dateText}>
                                {filters.endDate ? filters.endDate.toLocaleDateString() : 'End Date'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <CustomPicker
                        value={filters.account}
                        options={[{ label: 'All Accounts', value: '', icon: 'wallet' }, ...accounts]}
                        onValueChange={(value) => setFilters({...filters, account: value})}
                        placeholder="Select Account"
                        visible={showAccountPicker}
                        setVisible={setShowAccountPicker}
                    />
                </View>

                <View style={styles.section}>
                    <TouchableOpacity 
                        style={styles.exportButton}
                        onPress={() => handleExport('pdf')}
                    >
                        <Icon name="document-text" size={24} color="white" style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonText, { color: 'white' }]}>Export as PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.exportButton, { backgroundColor: '#217346' }]}
                        onPress={() => handleExport('excel')}
                    >
                        <Icon name="document" size={24} color="white" style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonText, { color: 'white' }]}>Export as Excel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {showStartDate && (
                <DateTimePicker
                    value={filters.startDate || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                        setShowStartDate(false);
                        if (date) setFilters({...filters, startDate: date});
                    }}
                />
            )}

            {showEndDate && (
                <DateTimePicker
                    value={filters.endDate || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                        setShowEndDate(false);
                        if (date) setFilters({...filters, endDate: date});
                    }}
                />
            )}
        </View>
    );
};

export default Export;

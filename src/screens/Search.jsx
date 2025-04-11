import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomPicker from '../components/common/CustomPicker';
import { fetchTransactionsByFilters, getAccounts } from '../utils/database';
import TransectionEntry from '../components/home/Transections/TransectionEntry';
import DateTimePicker from '@react-native-community/datetimepicker';
import BaseTransactionItem from '../components/common/BaseTransactionItem';

const Search = ({ navigation }) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        startDate: null,
        endDate: null,
        minAmount: '',
        maxAmount: '',
        account: '',
        category: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [showAccountPicker, setShowAccountPicker] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const fetchedAccounts = await getAccounts();
            setAccounts(fetchedAccounts.map(acc => ({
                label: acc.name,
                value: acc.name,
                icon: acc.icon || 'wallet-outline'
            })));
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const transactions = await fetchTransactionsByFilters(searchQuery, filters);
            setResults(transactions);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.cardBackground,
            elevation: 4,
        },
        searchInput: {
            flex: 1,
            height: 40,
            backgroundColor: theme.backgroundColor,
            borderRadius: 20,
            paddingHorizontal: 16,
            marginRight: 8,
            color: theme.color,
        },
        filterButton: {
            padding: 8,
        },
        filterContainer: {
            backgroundColor: theme.cardBackground,
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        filterRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        filterInput: {
            flex: 1,
            height: 40,
            backgroundColor: theme.backgroundColor,
            borderRadius: 8,
            paddingHorizontal: 8,
            marginHorizontal: 4,
            color: theme.color,
        },
        typeButton: {
            flex: 1,
            padding: 8,
            alignItems: 'center',
            borderRadius: 8,
            marginHorizontal: 4,
            backgroundColor: theme.cardBackground,
        },
        activeType: {
            backgroundColor: theme.appThemeColor,
        },
        typeText: {
            color: theme.color,
        },
        resultText: {
            color: theme.color,
            padding: 16,
            fontSize: 16,
        },
        noResults: {
            color: theme.color,
            textAlign: 'center',
            marginTop: 20,
            fontSize: 16,
            fontStyle: 'italic',
        },
        dateContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        dateButton: {
            flex: 1,
            backgroundColor: theme.backgroundColor,
            padding: 8,
            borderRadius: 8,
            marginHorizontal: 4,
            alignItems: 'center',
        },
        dateText: {
            color: theme.color,
        },
        accountContainer: {
            marginBottom: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    placeholderTextColor={theme.color + '80'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Icon
                        name={showFilters ? "options" : "options-outline"}
                        size={24}
                        color={theme.color}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={handleSearch}
                >
                    <Icon name="search" size={24} color={theme.color} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.filterContainer}>
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                filters.type === 'all' && styles.activeType
                            ]}
                            onPress={() => setFilters({ ...filters, type: 'all' })}
                        >
                            <Text style={styles.typeText}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                filters.type === 'income' && styles.activeType
                            ]}
                            onPress={() => setFilters({ ...filters, type: 'income' })}
                        >
                            <Text style={styles.typeText}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                filters.type === 'expense' && styles.activeType
                            ]}
                            onPress={() => setFilters({ ...filters, type: 'expense' })}
                        >
                            <Text style={styles.typeText}>Expense</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dateContainer}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowStartDate(true)}
                        >
                            <Text style={styles.dateText}>
                                {filters.startDate ? filters.startDate.toLocaleDateString() : 'Start Date'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowEndDate(true)}
                        >
                            <Text style={styles.dateText}>
                                {filters.endDate ? filters.endDate.toLocaleDateString() : 'End Date'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.accountContainer}>
                        <CustomPicker
                            value={filters.account}
                            options={[{ label: 'All Accounts', value: '', icon: 'wallet' }, ...accounts]}
                            onValueChange={(value) => setFilters({ ...filters, account: value })}
                            placeholder="Select Account"
                            visible={showAccountPicker}
                            setVisible={setShowAccountPicker}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        <TextInput
                            style={styles.filterInput}
                            placeholder="Min Amount"
                            placeholderTextColor={theme.color + '80'}
                            value={filters.minAmount}
                            onChangeText={(text) => setFilters({ ...filters, minAmount: text })}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.filterInput}
                            placeholder="Max Amount"
                            placeholderTextColor={theme.color + '80'}
                            value={filters.maxAmount}
                            onChangeText={(text) => setFilters({ ...filters, maxAmount: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            )}

            {showStartDate && (
                <DateTimePicker
                    value={filters.startDate || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                        setShowStartDate(false);
                        if (date) setFilters({ ...filters, startDate: date });
                    }}
                />
            )}

            {showEndDate && (
                <DateTimePicker
                    value={filters.endDate || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                        setShowEndDate(false);
                        if (date) setFilters({ ...filters, endDate: date });
                    }}
                />
            )}

            {results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Home', { targetDate: item.date })}
                        >
                            <BaseTransactionItem
                                transaction={item}
                            />
                        </TouchableOpacity>
                    )}
                    ListHeaderComponent={
                        <Text style={styles.resultText}>
                            Found {results.length} transactions
                        </Text>
                    }
                    style={{ padding: 16 }}
                />
            ) : (
                <Text style={styles.noResults}>
                    {searchQuery ? 'No transactions found' : 'Start searching...'}
                </Text>
            )}
        </View>
    );
};

export default Search;

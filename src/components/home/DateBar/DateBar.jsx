import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../../../hooks/ThemeContext'
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../../../src/redux/slices/dateSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { differenceInDays } from 'date-fns';

const DateBar = () => {
    const { theme } = useTheme();
    const dateCnt = useSelector(state => state.date.value);
    const inTotal = useSelector(state => state.transactions.inTotal);
    const exTotal = useSelector(state => state.transactions.exTotal);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + dateCnt);
        setDate(newDate);
    }, [dateCnt]);

    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        
        const currentDate = new Date();
        const daysDifference = differenceInDays(selectedDate, currentDate);
        dispatch({ type: 'date/setValue', payload: daysDifference });
        
        setShowDatePicker(false);
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: theme.appThemeColor,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        subContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
        },
        dateText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
        },
        totalText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '500',
        },
        arrowButton: {
            padding: 8,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
        dateButton: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.1)',
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => dispatch(decrement())}
                >
                    <Icon name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>
                        {date.toISOString().split('T')[0]}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.subContainer}>
                <Text style={styles.totalText}>
                    Total: {(inTotal-exTotal).toFixed(2)}
                </Text>
                <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => dispatch(increment())}
                >
                    <Icon name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

export default DateBar
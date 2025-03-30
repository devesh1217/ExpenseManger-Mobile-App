import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../../../hooks/ThemeContext'
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../../../src/redux/slices/dateSlice';

const DateBar = () => {
    const { theme } = useTheme();
    const dateCnt = useSelector(state => state.date.value);
    const inTotal = useSelector(state => state.transactions.inTotal);
    const exTotal = useSelector(state => state.transactions.exTotal);
    const [date, setDate] = useState(new Date());
    const dispatch = useDispatch();

    useEffect(() => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + dateCnt);
        setDate(newDate);
    }, [dateCnt]);

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: theme.appThemeColor,
            justifyContent: 'space-between',
            flexDirection: 'row',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        subContainer:{
            flexDirection: 'row',
            gap: 15,
            alignItems: 'center',
        },
        btn:{
            fontSize: 22,
            padding: 4,
            paddingHorizontal: 8,
        }
    });
    return (
        <View style={[styles.container]}>
            <View style={[styles.subContainer]}>
                <TouchableOpacity style={[]} onPress={() => dispatch(decrement())}>
                    <Text style={[{ color: 'white' }, styles.btn]}>{"<"}</Text>
                </TouchableOpacity>
                <Text style={[{ color: 'white', fontSize: 16 }]}>{date.toISOString().split('T')[0]}</Text>
            </View>
            <View style={[styles.subContainer]}>
                <Text style={[{ color: 'white', fontSize: 16 }]}>{'Total: '+(inTotal-exTotal)}</Text>
                <TouchableOpacity style={[]} onPress={() => dispatch(increment())}>
                    <Text style={[{ color: 'white' }, styles.btn]}>{">"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DateBar
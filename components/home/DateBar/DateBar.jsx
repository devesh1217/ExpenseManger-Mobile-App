import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../../ThemeContext'
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../../contexts/dateSlice';

const DateBar = () => {
    const { theme } = useTheme();
    const dateCnt = useSelector(state => state.date.value);
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
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: theme.__bg,
            justifyContent: 'space-between',
            flexDirection: 'row'
        },
        subContainer:{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
        },
        btn:{
            fontSize: 20,
            padding: 2,
            paddingHorizontal: 4,
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
                <TouchableOpacity style={[]} onPress={() => dispatch(increment())}>
                    <Text style={[{ color: 'white' }, styles.btn]}>{">"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DateBar
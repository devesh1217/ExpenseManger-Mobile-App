import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';

const FormContainer = () => {
    const styles = StyleSheet.create({
        formContainer: {
            width: '100%',
            justifyContent: 'start',
            alignItems: 'center',
            padding: 15
        },
        text: {
            color: 'white',
            fontSize: 18
        },
        btnWrapper:{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignContent: 'center',
            borderRadius: 50,
            width: '100%',
            overflow: 'hidden'
        },
        btn:{
            backgroundColor: '#777',
            width: '50%'
        },
        textCenter:{
            textAlign: 'center'
        }
    });
    const [isIncomeForm, setIncomeForm] = useState(false);
    const incomeBGC = isIncomeForm ? '#056655' : '#777';
    const expenseBGC = !isIncomeForm ? '#056655' : '#777';

    return (
        <View style={[styles.formContainer]}>
            <View style={[styles.btnWrapper]}>
                <TouchableOpacity style={[styles.btn, {backgroundColor: incomeBGC}]} onPress={()=>setIncomeForm(true)}>
                    <Text style={[styles.text, styles.textCenter]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, {backgroundColor: expenseBGC}]} onPress={()=>setIncomeForm(false)}>
                    <Text style={[styles.text, styles.textCenter]}>Expense</Text>
                </TouchableOpacity>
            </View>
            {
                isIncomeForm ? <IncomeForm /> : <ExpenseForm />
            }
        </View>
    )
}

export default FormContainer
import { View, Text, TextInput, Button, Pressable } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native';

const IncomeForm = () => {
    const styles = StyleSheet.create({
            form: {
                width: '100%',
                justifyContent: 'start',
                alignItems: 'center',
                padding: 15,
                gap: 10
            },
            text: {
                color: 'white',
                fontSize: 18
            },
            input:{
                width: '100%',
                borderBottomColor: '#056655',
                borderBottomWidth: 3,
            },
            textCenter:{
                textAlign: 'center'
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
                width: '50%',
                borderRadius: 30,
                padding: 5
            },
        });
    return (
        <View style={[styles.form]}>
            <TextInput placeholder='Title' style={[styles.input]} />
            <TextInput placeholder='Description' style={[styles.input]} />
            <TextInput placeholder='Amount' style={[styles.input]} />
            <TextInput placeholder='Account' style={[styles.input]} />
            <TextInput placeholder='Category' style={[styles.input]} />
            <View style={[styles.btnWrapper]}>
                <Pressable style={[styles.btn]} >
                    <Text style={[styles.text, styles.textCenter]} >Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default IncomeForm
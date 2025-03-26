import { Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import FormContainer from './Forms/FormContainer';
import TransectionsContainer from './Transections/TransectionsContainer';
import DateBar from './DateBar/DateBar';

const HomeContainer = () => {
    const styles = StyleSheet.create({
        homeContainer:{
            width: '100%',
            minHeight: '100%',
            justifyContent: 'start',
            alignItems: 'center',
            padding: 15
        },
        text:{
            color: 'white',
            fontSize: 18
        }

    });
    return (
        <ScrollView contentContainerStyle={[styles.homeContainer]}>
            <FormContainer />
            <DateBar />
            <TransectionsContainer />
        </ScrollView>
    )
}

export default HomeContainer
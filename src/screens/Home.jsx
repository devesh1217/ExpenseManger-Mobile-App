import { Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import FormContainer from '../components/home/Forms/FormContainer';
import TransectionsContainer from '../components/home/Transections/TransectionsContainer';
import DateBar from '../components/home/DateBar/DateBar';
import { useTheme } from '../hooks/ThemeContext';

const HomeContainer = () => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        homeContainer: {
            width: '100%',
            minHeight: '100%',
            justifyContent: 'start',
            alignItems: 'center',
            padding: 15,
            backgroundColor: theme.backgroundColor
        },
        text: {
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
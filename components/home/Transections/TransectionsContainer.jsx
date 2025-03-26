import { View } from 'react-native'
import React from 'react'
import TransectionIncome from './TransectionIncome'
import TransectionExpense from './TransectionExpense'

const TransectionsContainer = () => {

    return (
        <View>
            <TransectionIncome />
            <TransectionExpense />
        </View>
    )
}

export default TransectionsContainer
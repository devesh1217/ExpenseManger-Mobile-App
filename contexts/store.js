// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice'; // Example
import dateReducer from './dateSlice'
import transactionsReducer from './transactionSlice'

const store = configureStore({
    reducer: {
        counter: counterReducer,
        date: dateReducer,
        transactions: transactionsReducer
    },
});

export default store;
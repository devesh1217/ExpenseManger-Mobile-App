// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice'; // Example
import dateReducer from './slices/dateSlice'
import transactionsReducer from './slices/transactionSlice'

const store = configureStore({
    reducer: {
        counter: counterReducer,
        date: dateReducer,
        transactions: transactionsReducer
    },
});

export default store;
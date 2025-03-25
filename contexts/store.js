// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice'; // Example
import dateReducer from './dateSlice'

const store = configureStore({
    reducer: {
        counter: counterReducer,
        date: dateReducer,
    },
});

export default store;
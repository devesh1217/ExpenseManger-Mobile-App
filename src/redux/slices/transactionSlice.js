import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        expenses: [],
        incomes: [],
        exTotal: 0,
        inTotal: 0,
    },
    reducers: {
        addExpense: (state, action) => {
            state.expenses.push(action.payload);
            state.exTotal = action.payload.amount
        },
        addIncome: (state, action) => {
            state.incomes.push(action.payload);
            state.inTotal = action.payload.amount
        },
        setExpenses: (state, action) => {
            state.expenses = action.payload;
            state.exTotal = action.payload.reduce((sum, t) => sum + t.amount, 0)
        },
        setIncomes: (state, action) => {
            state.incomes = action.payload;
            state.inTotal = action.payload.reduce((sum, t) => sum + t.amount, 0)
        },
    },
});

export const { addExpense, addIncome, setExpenses, setIncomes } = transactionSlice.actions;
export default transactionSlice.reducer;

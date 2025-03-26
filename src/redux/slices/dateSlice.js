import { createSlice } from '@reduxjs/toolkit';

const dateSlice = createSlice({
    name: 'date',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            console.log(state, 'hi')
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
    },
});

export const { increment, decrement } = dateSlice.actions;
export default dateSlice.reducer;
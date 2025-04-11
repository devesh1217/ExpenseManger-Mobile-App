import { createSlice } from '@reduxjs/toolkit';

const dateSlice = createSlice({
    name: 'date',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        setValue: (state, action) => {
            state.value = action.payload;
        },
        setCounter: (state, action) => {
            state.value = action.payload;
        }
    },
});

export const { increment, decrement, setValue, setCounter } = dateSlice.actions;
export default dateSlice.reducer;
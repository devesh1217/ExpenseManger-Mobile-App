import { createSlice } from '@reduxjs/toolkit';
import { addDays, isAfter, startOfDay } from 'date-fns';

const dateSlice = createSlice({
    name: 'date',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            if(state.value == 0) {
                state.value = 0;
            } else state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        setValue: (state, action) => {
            state.value = action.payload <= 0 ? action.payload : state.value;
        },
        setCounter: (state, action) => {
            state.value = action.payload <= 0 ? action.payload : state.value;
        }
    },
});

export const { increment, decrement, setValue, setCounter } = dateSlice.actions;
export default dateSlice.reducer;
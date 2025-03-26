import { View } from 'react-native'
import React from 'react'
import TransectionIncome from './TransectionIncome'
import TransectionExpense from './TransectionExpense'
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
    runOnJS 
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { increment, decrement } from '../../../contexts/dateSlice';

const TransectionsContainer = () => {
    const dispatch = useDispatch();
    const translateX = useSharedValue(0);

    const handleIncrement = () => {
        dispatch(increment());
    };

    const handleDecrement = () => {
        dispatch(decrement());
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const swipeGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX;
        })
        .onEnd((e) => {
            if (e.translationX > 50) {
                runOnJS(handleDecrement)();
            } else if (e.translationX < -50) {
                runOnJS(handleIncrement)();
            }
            translateX.value = withSpring(0);
        });

    return (
        <GestureDetector gesture={swipeGesture}>
            <Animated.View style={animatedStyle}>
                <TransectionIncome />
                <TransectionExpense />
            </Animated.View>
        </GestureDetector>
    )
}

export default TransectionsContainer
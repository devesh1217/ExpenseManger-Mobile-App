import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, PanResponder, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import FormContainer from '../components/home/Forms/FormContainer';
import TransectionsContainer from '../components/home/Transections/TransectionsContainer';
import DateBar from '../components/home/DateBar/DateBar';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';  // Replace Expo icons
import { increment, decrement, setCounter } from '../redux/slices/dateSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { addDays, format, isAfter, startOfDay } from 'date-fns';
import { GestureHandlerRootView, GestureDetector, Directions, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

const HomeContainer = ({ route }) => {
    const { theme } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const counter = useSelector(state => state.date.value)
    const dispatch = useDispatch();

    useEffect(() => {
        if (route.params?.targetDate) {
            const targetDate = new Date(route.params.targetDate);
            const today = new Date();

            // Reset both dates to start of day
            today.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);

            // Calculate difference in days
            const diffTime = targetDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // Set counter directly to the difference in days
            dispatch(setCounter(diffDays));
        }
    }, [route.params?.targetDate]);

    const isFutureDate = (daysToAdd) => {
        return isAfter(
            startOfDay(addDays(new Date(), daysToAdd)),
            startOfDay(new Date())
        );
    };

    const handleNextDay = () => {
        if (!isFutureDate(counter + 1)) {
            dispatch(increment());
        }
    };

    const handleSwipe = (velocityX) => {
        if (velocityX < -500 && !isFutureDate(counter + 1)) {
            dispatch(increment());
        } else if (velocityX > 500) {
            dispatch(decrement());
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const today = startOfDay(new Date());
            const selected = startOfDay(selectedDate);
            const diffTime = selected.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (!isFutureDate(diffDays)) {
                dispatch(setCounter(diffDays));
            }
        }
    };

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onBegin(() => {
            'worklet';
        })
        .onUpdate(() => {
            'worklet';
        })
        .onEnd((event) => {
            'worklet';
            runOnJS(handleSwipe)(event.velocityX);
        });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundColor
        },
        scrollContainer: {
            flexGrow: 1,
            paddingHorizontal: 15,
            paddingVertical: 10,
            gap: 15
        },
        fab: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: theme.appThemeColor,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.cardBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            maxHeight: '90%',
            width: '100%',
            position: 'static',
            bottom: 0
        },
        dateContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
        date: {
            fontSize: 18,
            color: theme.color,
        },
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={swipeGesture}>
                <View style={styles.container}>
                    <View style={styles.dateContainer}>
                        <TouchableOpacity onPress={() => dispatch(decrement())}>
                            <Icon name="chevron-back" size={24} color={theme.color} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.date}>
                                {format(addDays(new Date(), counter), 'dd MMM yyyy')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleNextDay}
                            disabled={isFutureDate(counter + 1)}
                            style={{ opacity: isFutureDate(counter + 1) ? 0.5 : 1 }}
                        >
                            <Icon name="chevron-forward" size={24} color={theme.color} />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={addDays(new Date(), counter)}
                            mode="date"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )}

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <TransectionsContainer />
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setShowModal(true)}
                    >
                        <Icon name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </GestureDetector>
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                            <FormContainer onClose={() => setShowModal(false)} defaultAccount={route.params?.defaultAccount} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </GestureHandlerRootView>
    );
};

export default HomeContainer
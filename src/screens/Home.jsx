import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, PanResponder } from 'react-native'
import React, { useState, useEffect } from 'react'
import FormContainer from '../components/home/Forms/FormContainer';
import TransectionsContainer from '../components/home/Transections/TransectionsContainer';
import DateBar from '../components/home/DateBar/DateBar';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';  // Replace Expo icons
import { increment, decrement, setCounter } from '../redux/slices/dateSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { addDays } from 'date-fns';

const HomeContainer = ({ route }) => {
    const { theme } = useTheme();
    const [showModal, setShowModal] = useState(false);
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

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                    // Only respond to horizontal gestures
                    return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dx > 100) {
                        dispatch(decrement());
                    } else if (gestureState.dx < -100) {
                        dispatch(increment());
                    }
                },
            }),
        [dispatch]
    );

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
            position: 'absolute',
            bottom: 0
        },
    });

    return (
        <>
            <View style={styles.container} {...panResponder.panHandlers}>
                <DateBar />
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
        </>
    );
};

export default HomeContainer
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import FormContainer from '../components/home/Forms/FormContainer';
import TransectionsContainer from '../components/home/Transections/TransectionsContainer';
import DateBar from '../components/home/DateBar/DateBar';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';  // Replace Expo icons
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
    runOnJS
} from 'react-native-reanimated';

const HomeContainer = () => {
    const { theme } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const translateY = useSharedValue(Dimensions.get('window').height);
    const backdropOpacity = useSharedValue(0);

    const showTransactionForm = () => {
        setShowModal(true);
        backdropOpacity.value = withTiming(0.5, { duration: 300 });
        translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
        });
    };

    const hideTransactionForm = () => {
        backdropOpacity.value = withTiming(0, { duration: 300 });
        translateY.value = withSpring(Dimensions.get('window').height, {
            damping: 20,
            stiffness: 90,
        }, () => {
            runOnJS(setShowModal)(false);
        });
    };

    const backdropStyle = useAnimatedStyle(() => ({
        backgroundColor: 'black',
        opacity: backdropOpacity.value,
    }));

    const modalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

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
        backdrop: {
            ...StyleSheet.absoluteFillObject,
        },
        animatedModal: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.cardBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingVertical: 20,
            maxHeight: '90%',
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });

    return (
        <View style={styles.container}>
            <DateBar />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TransectionsContainer />
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={showTransactionForm}
            >
                <Icon name="add" size={24} color="white" />
            </TouchableOpacity>

            {showModal && (
                <>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={hideTransactionForm}
                    >
                        <Animated.View style={[styles.backdrop, backdropStyle]} />
                    </TouchableOpacity>

                    <Animated.View style={[styles.animatedModal, modalStyle]}>
                        <FormContainer onClose={hideTransactionForm} />
                    </Animated.View>
                </>
            )}
        </View>
    );
};

export default HomeContainer
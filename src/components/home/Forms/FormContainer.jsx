import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Animated, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import { useTheme } from '../../../hooks/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const FormContainer = ({ onClose }) => {
    const [activeForm, setActiveForm] = useState('income');
    const { theme } = useTheme();
    const slideAnim = useRef(new Animated.Value(0)).current;
    const windowWidth = Dimensions.get('window').width;  // Get window width
    const navigation = useNavigation();

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > 50 && activeForm === 'expense') {
                toggleForm('income');
            } else if (gestureState.dx < -50 && activeForm === 'income') {
                toggleForm('expense');
            }
        },
    });

    const toggleForm = (formType) => {
        setActiveForm(formType);
        Animated.spring(slideAnim, {
            toValue: formType === 'income' ? 0 : 1,
            useNativeDriver: true,
        }).start();
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },
        tabContainer: {
            flexDirection: 'row',
            marginBottom: 10,
            paddingHorizontal: 15,
        },
        tab: {
            flex: 1,
            padding: 10,
            alignItems: 'center',
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: theme.appThemeColor,
        },
        tabText: {
            color: theme.color,
            fontSize: 16,
        },
        formContainer: {
            flex: 1,
            width: '200%', // Double width to hold both forms
            flexDirection: 'row',
        },
        formWrapper: {
            width: '50%', // Each form takes half of the container
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeForm === 'income' && styles.activeTab]} 
                    onPress={() => toggleForm('income')}
                >
                    <Text style={styles.tabText}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeForm === 'expense' && styles.activeTab]} 
                    onPress={() => toggleForm('expense')}
                >
                    <Text style={styles.tabText}>Expense</Text>
                </TouchableOpacity>
            </View>
            
            <Animated.View 
                {...panResponder.panHandlers}
                style={[
                    styles.formContainer,
                    {
                        transform: [{
                            translateX: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -windowWidth]  // Use windowWidth
                            })
                        }]
                    }
                ]}
            >
                <View style={styles.formWrapper}>
                    <IncomeForm onClose={onClose} navigation={navigation} />
                </View>
                <View style={styles.formWrapper}>
                    <ExpenseForm onClose={onClose} navigation={navigation} />
                </View>
            </Animated.View>
        </View>
    );
};

export default FormContainer;
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomPicker = ({ 
    value, 
    options, 
    onValueChange, 
    placeholder = "Select an option",
    visible,
    setVisible 
}) => {
    const { theme } = useTheme();
    const styles = StyleSheet.create({
        pickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(5, 102, 85, 0.1)',
            padding: 12,
            borderRadius: 8,
            marginVertical: 5,
        },
        selectedText: {
            color: theme.color,
            fontSize: 16,
        },
        placeholderText: {
            color: theme.color + '80',
            fontSize: 16,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerContainer: {
            width: '80%',
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            overflow: 'hidden',
        },
        pickerHeader: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        pickerTitle: {
            color: theme.color,
            fontSize: 18,
            fontWeight: 'bold',
        },
        optionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        selectedOption: {
            backgroundColor: theme.appThemeColor + '20',
        },
        optionText: {
            color: theme.color,
            fontSize: 16,
            marginLeft: 12,
        }
    });

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <>
            <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setVisible(true)}
            >
                <Text style={selectedOption ? styles.selectedText : styles.placeholderText}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Icon name="chevron-down" size={20} color={theme.color} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>{placeholder}</Text>
                        </View>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionItem,
                                    value === option.value && styles.selectedOption
                                ]}
                                onPress={() => {
                                    onValueChange(option.value);
                                    setVisible(false);
                                }}
                            >
                                <Icon name={option.icon} size={20} color={theme.color} />
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default CustomPicker;

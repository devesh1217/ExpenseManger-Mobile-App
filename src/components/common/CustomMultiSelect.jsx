import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/ThemeContext';

const CustomMultiSelect = ({ title, items, selectedItems, onItemToggle, visible, setVisible }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        button: {
            flex: 1,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: theme.cardBackground,
        },
        buttonText: {
            color: theme.color,
            fontSize: 16,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        pickerContainer: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            width: '100%',
            maxHeight: '80%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.color,
        },
        itemContainer: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: theme.appThemeColor,
            marginRight: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checked: {
            backgroundColor: theme.appThemeColor,
        },
        itemText: {
            color: theme.color,
            fontSize: 16,
        },
        selectedChips: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        chip: {
            backgroundColor: theme.appThemeColor + '20',
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
        },
        chipText: {
            color: theme.color,
            marginRight: 4,
        },
    });

    return (
        <>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.buttonText}>
                    {selectedItems.length 
                        ? `${selectedItems.length} ${title} selected` 
                        : `Select ${title}`}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.pickerContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{`Select ${title}`}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Icon name="close" size={24} color={theme.color} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {items.map(item => (
                                <TouchableOpacity
                                    key={item.id || item.value}
                                    style={styles.itemContainer}
                                    onPress={() => onItemToggle(item.name || item.value)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        selectedItems.includes(item.name || item.value) && styles.checked
                                    ]}>
                                        {selectedItems.includes(item.name || item.value) && (
                                            <Icon name="checkmark" size={16} color="white" />
                                        )}
                                    </View>
                                    <Text style={styles.itemText}>{item.name || item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {selectedItems.length > 0 && (
                <View style={styles.selectedChips}>
                    {selectedItems.map(item => (
                        <View key={item} style={styles.chip}>
                            <Text style={styles.chipText}>{item}</Text>
                            <TouchableOpacity onPress={() => onItemToggle(item)}>
                                <Icon name="close-circle" size={16} color={theme.color} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </>
    );
};

export default CustomMultiSelect;

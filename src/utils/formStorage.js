import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFormState = async (type, formData) => {
    try {
        console.log(type, formData);
        await AsyncStorage.setItem(`@form_${type}`, JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving form state:', error);
    }
};

export const loadFormState = async (type) => {
    try {
        const saved = await AsyncStorage.getItem(`@form_${type}`);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading form state:', error);
        return null;
    }
};

export const clearFormState = async (type) => {
    try {
        await AsyncStorage.removeItem(`@form_${type}`);
    } catch (error) {
        console.error('Error clearing form state:', error);
    }
};

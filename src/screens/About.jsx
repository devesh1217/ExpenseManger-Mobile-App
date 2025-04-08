import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const About = ({ navigation }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.backgroundColor,
            padding: 16,
            minHeight: '100%',
            width: '100%',
            position: 'relative',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
        },
        backButton: {
            padding: 8,
            marginRight: 16,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.color,
        },
        section: {
            backgroundColor: theme.cardBackground,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.color,
            marginBottom: 8,
        },
        text: {
            color: theme.color,
            fontSize: 16,
            lineHeight: 24,
        },
        version: {
            color: theme.color,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: 16,
            position: 'absolute',
            top: '100%',
            left: 10,
        },
    });

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={theme.color} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.title}>Description</Text>
                <Text style={styles.text}>
                    MyExpenseManager is a comprehensive expense tracking application designed 
                    to help you manage your personal finances effectively.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Features</Text>
                <Text style={styles.text}>
                    • Track daily income and expenses{'\n'}
                    • Multiple account management{'\n'}
                    • Customizable categories{'\n'}
                    • Monthly and yearly reports{'\n'}
                    • Detailed analytics and charts
                </Text>
            </View>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
};

export default About;

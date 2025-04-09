import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import googleDriveService from '../../utils/googleDriveService';

const GoogleDriveBackup = ({ navigation }) => {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [lastBackup, setLastBackup] = useState(null);

    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const userInfo = await GoogleSignin.getCurrentUser();
            if (userInfo) {
                setIsConnected(true);
                setUserEmail(userInfo.user.email);
                const lastBackupDate = await AsyncStorage.getItem('lastBackup');
                setLastBackup(lastBackupDate);
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    };

    const handleConnect = async () => {
        try {
            setIsLoading(true);
            const userInfo = await googleDriveService.signIn();
            setIsConnected(true);
            setUserEmail(userInfo.user.email);

            const hasBackup = await googleDriveService.checkForExistingBackup();
            if (hasBackup) {
                Alert.alert(
                    'Backup Found',
                    'A backup was found in Google Drive. Would you like to restore it?',
                    [
                        {
                            text: 'No',
                            style: 'cancel'
                        },
                        {
                            text: 'Yes',
                            onPress: handleRestore
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Connection Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            setIsLoading(true);
            await googleDriveService.uploadBackup();
            const now = new Date().toISOString();
            setLastBackup(now);
            Alert.alert('Success', 'Backup completed successfully');
        } catch (error) {
            Alert.alert('Backup Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        Alert.alert(
            'Confirm Restore',
            'This will replace all your current data with the backup from Google Drive. Are you sure?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await googleDriveService.restoreBackup();
                            Alert.alert('Success', 'Data restored successfully',
                                [{ text: 'OK', onPress: () => navigation.replace('MainStack') }]
                            );
                        } catch (error) {
                            Alert.alert('Restore Failed', error.message);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await googleDriveService.signOut();
            setIsConnected(false);
            setUserEmail(null);
            setLastBackup(null);
        } catch (error) {
            Alert.alert('Sign Out Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {isConnected ? (
                <>
                    <View style={styles.accountInfo}>
                        <Icon name="logo-google" size={24} color={theme.color} />
                        <View style={styles.accountDetails}>
                            <Text style={styles.emailText}>Connected as:</Text>
                            <Text style={styles.email}>{userEmail}</Text>
                            {lastBackup && (
                                <Text style={styles.lastBackup}>
                                    Last backup: {new Date(lastBackup).toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.backupButton]}
                            onPress={handleBackup}
                        >
                            <Icon name="cloud-upload" size={20} color="white" />
                            <Text style={styles.buttonText}>Backup Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.restoreButton]}
                            onPress={handleRestore}
                        >
                            <Icon name="cloud-download" size={20} color="white" />
                            <Text style={styles.buttonText}>Restore</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.signOutButton]}
                            onPress={handleSignOut}
                        >
                            <Icon name="log-out" size={20} color="white" />
                            <Text style={styles.buttonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <TouchableOpacity 
                    style={[styles.button, styles.connectButton]}
                    onPress={handleConnect}
                >
                    <Icon name="logo-google" size={20} color="white" />
                    <Text style={styles.buttonText}>Connect Google Drive</Text>
                </TouchableOpacity>
            )}

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.appThemeColor} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Add your styles here...
});

export default GoogleDriveBackup;

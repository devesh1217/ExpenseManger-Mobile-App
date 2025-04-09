import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { googleCredentials } from '../config/googleCredentials';
import { createBackup } from './backupUtils';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Initialize GoogleSignin configuration
export const configureGoogleSignIn = () => {
    try {
        GoogleSignin.configure({
            ...googleCredentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
            offlineAccess: true
        });
    } catch (error) {
        console.error('Error configuring GoogleSignin:', error);
    }
};

const BACKUP_FILENAME = 'MyExpenseManager_backup.json';
const MIME_TYPE = 'application/json';
const BACKUP_FOLDER_NAME = 'MyExpenseManager Backups';

const checkIsSignedIn = async () => {
    try {
        // First check if Play Services are available
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) {
            const userInfo = await GoogleSignin.signIn();
            console.log('User signed in:', userInfo);
        }
        return true;
    } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            throw new Error('Sign in cancelled');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            throw new Error('Sign in already in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Play services not available or outdated');
        } else {
            console.error('Google Sign-In error:', error);
            throw error;
        }
    }
};

export const createBackupFolder = async (accessToken) => {
    try {
        const metadata = {
            name: BACKUP_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const response = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });

        if (!response.ok) {
            throw new Error('Failed to create backup folder');
        }

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Create folder error:', error);
        throw error;
    }
};

export const uploadToGoogleDrive = async () => {
    try {
        // Ensure user is signed in before proceeding
        await checkIsSignedIn();

        // Create backup file
        const backupPath = await createBackup();
        const backupContent = await RNFS.readFile(backupPath, 'utf8');

        // Get access token
        const { accessToken } = await GoogleSignin.getTokens();
        if (!accessToken) {
            throw new Error('No access token available');
        }

        // Find or create backup folder
        let folderId = await AsyncStorage.getItem('backupFolderId');
        if (!folderId) {
            folderId = await createBackupFolder(accessToken);
            await AsyncStorage.setItem('backupFolderId', folderId);
        }

        // Upload to Google Drive
        const metadata = {
            name: `${BACKUP_FILENAME}_${new Date().toISOString()}`,
            mimeType: MIME_TYPE,
            parents: [folderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([backupContent], { type: MIME_TYPE }));

        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: form
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        // Save backup metadata
        await AsyncStorage.setItem('lastCloudBackup', new Date().toISOString());

        return response.json();
    } catch (error) {
        console.error('Google Drive backup error:', error);
        Alert.alert('Backup Failed', error.message || 'Failed to upload backup to Google Drive');
        throw error;
    }
};

export const listGoogleDriveBackups = async () => {
    try {
        const { accessToken } = await GoogleSignin.getTokens();
        const folderId = await AsyncStorage.getItem('backupFolderId');

        if (!folderId) {
            return [];
        }

        const query = `'${folderId}' in parents`;
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error('List backups error:', error);
        throw error;
    }
};

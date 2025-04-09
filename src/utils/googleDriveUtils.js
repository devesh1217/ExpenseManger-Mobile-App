import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createBackup } from './backupUtils';
import RNFS from 'react-native-fs';

// Configure Google Sign-In
GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
    offlineAccess: true
});

const BACKUP_FILENAME = 'MyExpenseManager_backup.json';
const MIME_TYPE = 'application/json';

export const initializeGoogleDrive = async () => {
    try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) {
            await GoogleSignin.signIn();
        }
        return true;
    } catch (error) {
        console.error('Google Drive initialization error:', error);
        throw error;
    }
};

export const uploadToGoogleDrive = async () => {
    try {
        await initializeGoogleDrive();
        const tokens = await GoogleSignin.getTokens();
        
        // Create local backup
        const backupPath = await createBackup();
        const backupContent = await RNFS.readFile(backupPath, 'utf8');

        // Search for existing backup file
        const existingFile = await searchFile(tokens.accessToken);
        
        if (existingFile) {
            // Update existing file
            await updateFile(tokens.accessToken, existingFile.id, backupContent);
            return existingFile.id;
        } else {
            // Create new file
            return await createFile(tokens.accessToken, backupContent);
        }
    } catch (error) {
        console.error('Upload to Google Drive error:', error);
        throw error;
    }
};

export const restoreFromGoogleDrive = async () => {
    try {
        await initializeGoogleDrive();
        const tokens = await GoogleSignin.getTokens();
        
        // Search for backup file
        const backupFile = await searchFile(tokens.accessToken);
        if (!backupFile) {
            throw new Error('No backup found on Google Drive');
        }

        // Download file content
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${backupFile.id}?alt=media`,
            {
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to download backup file');
        }

        const content = await response.text();
        return JSON.parse(content);
    } catch (error) {
        console.error('Restore from Google Drive error:', error);
        throw error;
    }
};

const searchFile = async (accessToken) => {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}'`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    const data = await response.json();
    return data.files?.[0];
};

const createFile = async (accessToken, content) => {
    const metadata = {
        name: BACKUP_FILENAME,
        mimeType: MIME_TYPE
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: MIME_TYPE }));

    const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: form
        }
    );

    const data = await response.json();
    return data.id;
};

const updateFile = async (accessToken, fileId, content) => {
    const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': MIME_TYPE
            },
            body: content
        }
    );

    return response.ok;
};

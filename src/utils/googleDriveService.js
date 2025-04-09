import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { createBackup } from './backupUtils';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

class GoogleDriveService {
    constructor() {
        this.initializeGoogleSignIn();
    }

    initializeGoogleSignIn() {
        try {
            GoogleSignin.configure({
                webClientId: '246513769064-9th4qrtipqfcmf1962ot6mg03b1hfou7.apps.googleusercontent.com',
                offlineAccess: true
            });
        } catch (error) {
            console.error('Failed to initialize Google Sign-In:', error);
        }
    }

    async checkSignIn() {
        try {
            await this.initializeGoogleSignIn();
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            try {
                const isSignedIn = await GoogleSignin.isSignedIn();
                if (!isSignedIn) {
                    const userInfo = await GoogleSignin.signIn();
                    await AsyncStorage.setItem('googleUser', JSON.stringify(userInfo));
                }
            } catch (error) {
                const userInfo = await GoogleSignin.signIn();
                await AsyncStorage.setItem('googleUser', JSON.stringify(userInfo));
            }

            return true;
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                throw new Error('Sign in was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                throw new Error('Sign in is already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Play services not available');
            }
            throw error;
        }
    }

    async getUserInfo() {
        try {
            const userInfo = await AsyncStorage.getItem('googleUser');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    async getBackupStatus() {
        try {
            const [userInfo, lastBackup] = await Promise.all([
                this.getUserInfo(),
                AsyncStorage.getItem('lastGoogleBackup')
            ]);

            return {
                isConnected: !!userInfo,
                email: userInfo?.user?.email || null,
                lastBackupDate: lastBackup ? new Date(lastBackup) : null
            };
        } catch (error) {
            console.error('Error getting backup status:', error);
            return {
                isConnected: false,
                email: null,
                lastBackupDate: null
            };
        }
    }

    async uploadToGoogleDrive() {
        try {
            await this.checkSignIn();
            const backupPath = await createBackup();
            const backupContent = await RNFS.readFile(backupPath, 'utf8');
            
            const { accessToken } = await GoogleSignin.getTokens();
            
            const metadata = {
                name: `backup_${new Date().toISOString()}.json`,
                mimeType: 'application/json'
            };

            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/related; boundary=foo_bar_baz'
                    },
                    body: '--foo_bar_baz\r\n' +
                          'Content-Type: application/json\r\n\r\n' +
                          JSON.stringify(metadata) + '\r\n' +
                          '--foo_bar_baz\r\n' +
                          'Content-Type: application/json\r\n\r\n' +
                          backupContent + '\r\n' +
                          '--foo_bar_baz--'
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            await AsyncStorage.setItem('lastGoogleBackup', new Date().toISOString());
            return await response.json();
        } catch (error) {
            console.error('Backup error:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const accessToken = await GoogleSignin.getTokens();
            const response = await fetch(
                'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=modifiedTime desc',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken.accessToken}`,
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to list backups');
            }

            const data = await response.json();
            return data.files || [];
        } catch (error) {
            throw error;
        }
    }

    async downloadBackup(fileId) {
        try {
            const { accessToken } = await GoogleSignin.getTokens();
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Download failed');
            }

            return await response.json();
        } catch (error) {
            throw new Error('Backup download failed: ' + error.message);
        }
    }

    async signOut() {
        try {
            await GoogleSignin.signOut();
            await AsyncStorage.removeItem('googleUser');
            await AsyncStorage.removeItem('lastGoogleBackup');
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    async getCurrentUserInfo() {
        try {
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
                return {
                    email: currentUser.user.email,
                    name: currentUser.user.name
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
}

export default new GoogleDriveService();

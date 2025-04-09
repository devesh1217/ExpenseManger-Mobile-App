import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleConfig } from '../config/googleConfig';

class GoogleAuthService {
    constructor() {
        GoogleSignin.configure({
            webClientId: googleConfig.webClientId,
            offlineAccess: true,
            scopes: googleConfig.scopes
        });
    }

    async getStoredUser() {
        try {
            const userString = await AsyncStorage.getItem('googleUser');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('Error getting stored user:', error);
            return null;
        }
    }

    async signIn() {
        try {
            const storedUser = await this.getStoredUser();
            if (storedUser) {
                const isSignedIn = await GoogleSignin.isSignedIn();
                if (isSignedIn) {
                    return storedUser;
                }
            }

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            await AsyncStorage.setItem('googleUser', JSON.stringify(userInfo));
            return userInfo;
        } catch (error) {
            console.error('Google Sign-In error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await GoogleSignin.signOut();
            await AsyncStorage.removeItem('googleUser');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    async getValidToken() {
        try {
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (!isSignedIn) {
                await this.signIn();
            }
            const tokens = await GoogleSignin.getTokens();
            return tokens.accessToken;
        } catch (error) {
            console.error('Error getting token:', error);
            throw error;
        }
    }
}

export default new GoogleAuthService();

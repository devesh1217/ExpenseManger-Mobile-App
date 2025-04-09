const ENCRYPTION_KEY = 'MyExpenseManagerSecure2024';

export const encryptData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        let encrypted = '';
        for(let i = 0; i < jsonString.length; i++) {
            const charCode = jsonString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            encrypted += String.fromCharCode(charCode);
        }
        const base64 = btoa(encrypted);
        return base64;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decryptData = (encryptedData) => {
    try {
        const encrypted = atob(encryptedData);
        let decrypted = '';
        for(let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            decrypted += String.fromCharCode(charCode);
        }
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

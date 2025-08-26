import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBackup } from './backupUtils';

const BACKUP_INTERVAL_KEY = 'backupInterval';
const LAST_BACKUP_KEY = 'lastBackupDate';

export const BackupIntervals = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    NEVER: 'never'
};

export const setBackupInterval = async (interval) => {
    try {
        await AsyncStorage.setItem(BACKUP_INTERVAL_KEY, interval);
        if (interval !== BackupIntervals.NEVER) {
            // Trigger initial backup when setting a new interval
            await checkAndCreateBackup(true);
        }
    } catch (error) {
        console.error('Error setting backup interval:', error);
    }
};

export const getBackupInterval = async () => {
    try {
        return await AsyncStorage.getItem(BACKUP_INTERVAL_KEY) || BackupIntervals.WEEKLY;
    } catch (error) {
        console.error('Error getting backup interval:', error);
        return BackupIntervals.WEEKLY;
    }
};

const shouldCreateBackup = async () => {
    try {
        const lastBackup = await AsyncStorage.getItem(LAST_BACKUP_KEY);
        const interval = await getBackupInterval();
        
        if (!lastBackup || interval === BackupIntervals.NEVER) return false;
        
        const lastBackupDate = new Date(lastBackup);
        const now = new Date();
        const daysSinceLastBackup = (now - lastBackupDate) / (1000 * 60 * 60 * 24);

        switch (interval) {
            case BackupIntervals.DAILY:
                return daysSinceLastBackup >= 1;
            case BackupIntervals.WEEKLY:
                return daysSinceLastBackup >= 7;
            case BackupIntervals.MONTHLY:
                return daysSinceLastBackup >= 30;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error checking backup status:', error);
        return false;
    }
};

export const checkAndCreateBackup = async (force = false) => {
    try {
        if (force || await shouldCreateBackup()) {
            const backupPath = await createBackup();
            await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
            return backupPath;
        }
        return null;
    } catch (error) {
        console.error('Auto backup error:', error);
        return null;
    }
};

export const getLastBackupDate = async () => {
    try {
        const date = await AsyncStorage.getItem(LAST_BACKUP_KEY);
        return date ? new Date(date) : null;
    } catch (error) {
        console.error('Error getting last backup date:', error);
        return null;
    }
};

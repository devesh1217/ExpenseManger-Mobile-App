import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'MyExpenseManager.db';
const BACKUP_DIR = `${RNFS.ExternalDirectoryPath}/backup`;
const BACKUP_FILE = `${BACKUP_DIR}/ArthaLekha_backup.json`;

export const createBackup = async () => {
    try {
        // Ensure backup directory exists
        await RNFS.mkdir(BACKUP_DIR);

        // Get database data
        const db = SQLite.openDatabase({ name: DB_NAME, location: 'default' });
        const tables = ['Accounts', 'Categories', 'Transactions'];
        const backupData = { database: {}, settings: {} };

        // Backup each table
        await Promise.all(tables.map(async (table) => {
            return new Promise((resolve, reject) => {
                db.transaction(tx => {
                    tx.executeSql(
                        `SELECT * FROM ${table}`,
                        [],
                        (_, result) => {
                            const rows = [];
                            for (let i = 0; i < result.rows.length; i++) {
                                rows.push(result.rows.item(i));
                            }
                            backupData.database[table] = rows;
                            resolve();
                        },
                        (_, error) => reject(error)
                    );
                });
            });
        }));

        // Backup AsyncStorage settings
        const allKeys = await AsyncStorage.getAllKeys();
        const allSettings = await AsyncStorage.multiGet(allKeys);
        backupData.settings = Object.fromEntries(allSettings);

        // Save backup file
        await RNFS.writeFile(BACKUP_FILE, JSON.stringify(backupData), 'utf8');
        
        return BACKUP_FILE;
    } catch (error) {
        console.error('Backup error:', error);
        throw error;
    }
};

export const restoreFromBackup = async () => {
    try {
        const backupExists = await RNFS.exists(BACKUP_FILE);
        if (!backupExists) {
            throw new Error('No backup file found');
        }

        const backupContent = await RNFS.readFile(BACKUP_FILE, 'utf8');
        const backupData = JSON.parse(backupContent);
        const db = SQLite.openDatabase({ name: DB_NAME, location: 'default' });

        // Restore database tables
        await new Promise((resolve, reject) => {
            db.transaction(tx => {
                // Delete existing data
                Object.keys(backupData.database).forEach(table => {
                    tx.executeSql(`DELETE FROM ${table}`);
                });

                // Insert backup data
                Object.entries(backupData.database).forEach(([table, rows]) => {
                    rows.forEach(row => {
                        const columns = Object.keys(row).join(', ');
                        const values = Object.values(row);
                        const placeholders = values.map(() => '?').join(', ');
                        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
                        tx.executeSql(query, values);
                    });
                });
            }, reject, resolve);
        });

        // Restore settings
        await AsyncStorage.multiSet(Object.entries(backupData.settings));

        return true;
    } catch (error) {
        console.error('Restore error:', error);
        throw error;
    }
};

export const checkBackupExists = async () => {
    try {
        return await RNFS.exists(BACKUP_FILE);
    } catch (error) {
        console.error('Check backup error:', error);
        return false;
    }
};

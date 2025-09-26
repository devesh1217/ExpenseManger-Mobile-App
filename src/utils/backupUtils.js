import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { pick, types, isCancel  } from '@react-native-documents/picker';


const DB_NAME = 'MyExpenseManager.db';
const BACKUP_DIR = `${RNFS.DownloadDirectoryPath}/ArthaLekha/backup`;
const BACKUP_FILE = `${BACKUP_DIR}/ArthaLekha_backup.json`;

export const createBackup = async () => {
    try {
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

        // Write to temp file first
        const tempFilePath = `${RNFS.CachesDirectoryPath}/ArthaLekha_backup_${Date.now()}.json`;
        await RNFS.writeFile(tempFilePath, JSON.stringify(backupData), 'utf8');

        // Copy to backup destination (overwrite if exists)
        await RNFS.copyFile(tempFilePath, BACKUP_FILE);

        // Delete temp file
        await RNFS.unlink(tempFilePath);

        return BACKUP_FILE;
    } catch (error) {
        console.log(error, error.message)
        console.error('Backup error:', error);
        throw error;
    }
};

export const restoreFromBackup = async () => {
    try {
        const res = await pick({
            type: [types.json],
            allowMultiSelection: false,
            copyTo: 'documentDirectory',
            presentationStyle: 'fullScreen',
            initialDirectory: BACKUP_DIR
        });

        const backupContent = await RNFS.readFile(res[0].uri, 'utf8');
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
    } catch (err) {
        if (isCancel(err)) {
            // User cancelled the picker
            return false;
        } else {
            console.error('Restore error:', err);
            throw err;
        }
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

import SQLite from 'react-native-sqlite-storage';
import { addDays } from 'date-fns';

const db = SQLite.openDatabase(
  {
    name: 'MyExpenseManager.db',
    location: 'default',
  },
  () => console.log('Database opened'),
  (err) => console.error('Error opening database:', err)
);

export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        amount REAL,
        account TEXT,
        category TEXT,
        type TEXT,
        date TIMESTAMP 
      );`
    );
  });
};

export const insertTransaction = (transaction, dateCounter) => {
  const { title, description, amount, account, category, type } = transaction;
  const date = addDays(new Date(), dateCounter).toISOString().split('T')[0];
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO Transactions (title, description, amount, account, category, type, date) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [title, description, amount, account, category, type, date]
    );
  });
};

export const fetchTransactions = (type, date, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM Transactions WHERE type = ? AND date(date) = date(?);`, // Fixed column name
      [type, date],
      (_, results) => {
        const rows = results.rows;
        let transactions = [];
        for (let i = 0; i < rows.length; i++) {
          transactions.push(rows.item(i));
        }
        callback(transactions);
      },
      (error) => {
        console.error('Error fetching transactions:', error); // Log errors if any
      }
    );
  });
};

export const fetchMonthlyTransactions = (type, date, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM Transactions WHERE type = ? AND strftime('%Y-%m', date) = strftime('%Y-%m', ?);`,
      [type, date],
      (_, results) => {
        const rows = results.rows;
        let transactions = [];
        for (let i = 0; i < rows.length; i++) {
          transactions.push(rows.item(i));
        }
        callback(transactions);
      },
      (error) => {
        console.error('Error fetching transactions:', error); // Log errors if any
      }
    );
  });
};
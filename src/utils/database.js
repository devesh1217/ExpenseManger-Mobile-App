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

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS CustomAccounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        isDefault INTEGER DEFAULT 0
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS CustomCategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        UNIQUE(name, type)
      );
    `);
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

export const getAccounts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CustomAccounts;',
        [],
        (_, results) => {
          const accounts = [];
          for (let i = 0; i < results.rows.length; i++) {
            accounts.push(results.rows.item(i));
          }
          resolve(accounts);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addCustomAccount = (name) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO CustomAccounts (name) VALUES (?);',
        [name],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateDefaultAccount = (accountName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE CustomAccounts SET isDefault = CASE WHEN name = ? THEN 1 ELSE 0 END;',
        [accountName],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCategories = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CustomCategories;',
        [],
        (_, results) => {
          const categories = {
            income: [],
            expense: []
          };
          for (let i = 0; i < results.rows.length; i++) {
            const item = results.rows.item(i);
            categories[item.type].push(item);
          }
          resolve(categories);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addCustomCategory = (name, type) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO CustomCategories (name, type) VALUES (?, ?);',
        [name, type],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAccountBalance = (accountName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
         FROM Transactions 
         WHERE account = ?;`,
        [accountName],
        (_, results) => resolve(results.rows.item(0).balance),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllAccountBalances = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First get all unique accounts from transactions
      tx.executeSql(
        `SELECT DISTINCT account FROM Transactions
         UNION
         SELECT name as account FROM CustomAccounts;`,
        [],
        async (_, results) => {
          const accounts = [];
          for (let i = 0; i < results.rows.length; i++) {
            const account = results.rows.item(i).account;
            const balance = await getAccountBalance(account);
            const isCustom = await isCustomAccount(account);
            accounts.push({
              name: account,
              balance,
              isCustom
            });
          }
          resolve(accounts);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const isCustomAccount = (accountName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT 1 FROM CustomAccounts WHERE name = ?;',
        [accountName],
        (_, results) => resolve(results.rows.length > 0),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE transactions SET title = ?, description = ?, amount = ?, category = ?, account = ?, date = ? WHERE id = ?',
        [
          transaction.title,
          transaction.description,
          transaction.amount,
          transaction.category,
          transaction.account,
          transaction.date,
          transaction.id
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteTransaction = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM transactions WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
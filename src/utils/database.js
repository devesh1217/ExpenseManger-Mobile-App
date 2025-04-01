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
    // Drop existing tables if needed
    tx.executeSql('DROP TABLE IF EXISTS CustomAccounts;');
    
    // Create new Accounts table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        icon TEXT,
        openingBalance REAL DEFAULT 0,
        isDefault INTEGER DEFAULT 0,
        isSystem INTEGER DEFAULT 0,
        isPermanent INTEGER DEFAULT 0
      );
    `);

    // Insert default accounts
    const defaultAccounts = [
      ['Cash', 'cash', 0, 1, 1, 1], // Added isPermanent flag
      ['Bank', 'bank', 0, 0, 1, 0],
      ['Card', 'card', 0, 0, 1, 0],
      ['UPI', 'phone-portrait', 0, 0, 1, 0],
      ['Savings', 'wallet', 0, 0, 1, 0]
    ];

    defaultAccounts.forEach(account => {
      tx.executeSql(
        'INSERT OR IGNORE INTO Accounts (name, icon, openingBalance, isDefault, isSystem, isPermanent) VALUES (?, ?, ?, ?, ?, ?);',
        account
      );
    });

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
        'SELECT * FROM Accounts ORDER BY isSystem DESC, name ASC;',
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

export const addAccount = (name, icon, openingBalance) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Accounts (name, icon, openingBalance) VALUES (?, ?, ?);',
        [name, icon, openingBalance || 0],
        (_, results) => {
          // Fetch the added account to return
          tx.executeSql(
            'SELECT * FROM Accounts WHERE id = ?',
            [results.insertId],
            (_, { rows }) => resolve(rows.item(0)),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const updateAccount = (id, name, icon, openingBalance) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First check if account is permanent
      tx.executeSql(
        'SELECT isPermanent FROM Accounts WHERE id = ?',
        [id],
        (_, results) => {
          if (results.rows.length === 0) {
            reject(new Error('Account not found'));
            return;
          }

          const account = results.rows.item(0);
          if (account.isPermanent) {
            reject(new Error('Cannot modify permanent account'));
            return;
          }

          tx.executeSql(
            'UPDATE Accounts SET name = ?, icon = ?, openingBalance = ? WHERE id = ?',
            [name, icon, openingBalance, id],
            (_, updateResults) => resolve(updateResults),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteAccount = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First check if account is permanent
      tx.executeSql(
        'SELECT name, isPermanent FROM Accounts WHERE id = ?',
        [id],
        (_, results) => {
          if (results.rows.length === 0) {
            reject(new Error('Account not found'));
            return;
          }

          const account = results.rows.item(0);
          if (account.isPermanent === 1) {  // Check for numeric value
            reject(new Error('Cannot delete permanent account'));
            return;
          }

          // Transfer all transactions to Cash account
          tx.executeSql(
            'UPDATE Transactions SET account = "Cash" WHERE account = ?',
            [account.name],
            () => {
              // Then delete the account
              tx.executeSql(
                'DELETE FROM Accounts WHERE id = ? AND isPermanent = 0',  // Add isPermanent check
                [id],
                (_, deleteResults) => resolve(deleteResults),
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const updateDefaultAccount = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Check if the target account is permanent (Cash)
      tx.executeSql(
        'SELECT name, isPermanent FROM Accounts WHERE id = ?',
        [id],
        (_, results) => {
          const targetAccount = results.rows.item(0);

          // Get current default account
          tx.executeSql(
            'SELECT id, isPermanent FROM Accounts WHERE isDefault = 1',
            [],
            (_, defaultResults) => {
              const currentDefault = defaultResults.rows.item(0);

              // If current default is permanent (Cash) and target is not Cash, reject
              if (currentDefault?.isPermanent === 1 && !targetAccount.isPermanent) {
                reject(new Error('Cannot change default from Cash account'));
                return;
              }

              // Proceed with update
              tx.executeSql(
                'UPDATE Accounts SET isDefault = CASE id WHEN ? THEN 1 ELSE 0 END',
                [id],
                (_, updateResults) => resolve(updateResults),
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
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
          (SELECT openingBalance FROM Accounts WHERE name = ?) +
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
         FROM Transactions 
         WHERE account = ?;`,
        [accountName, accountName],
        (_, results) => resolve(results.rows.item(0).balance),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllAccountBalances = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT a.*, 
          (a.openingBalance + COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0)) as balance
         FROM Accounts a
         LEFT JOIN Transactions t ON a.name = t.account
         GROUP BY a.id
         ORDER BY a.isSystem DESC, a.name ASC;`,
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

export const isCustomAccount = (accountName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT 1 FROM Accounts WHERE name = ?;',
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
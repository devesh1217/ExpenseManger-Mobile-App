export const accountOptions = [
    { label: 'Cash', value: 'Cash', icon: 'cash' },
    { label: 'Bank', value: 'Bank', icon: 'business' },
    { label: 'Credit Card', value: 'Credit Card', icon: 'card' },
    { label: 'UPI', value: 'UPI', icon: 'phone-portrait' },
    { label: 'Other', value: 'Other', icon: 'ellipsis-horizontal' }
];

export const defaultIncomeCategories = [
    ['Others', 'add-circle', 'income', 1, 1],
    ['Salary', 'cash', 'income', 1, 0],
    ['Business', 'business', 'income', 1, 0],
    ['Investment', 'trending-up', 'income', 1, 0],
    ['Freelance', 'laptop', 'income', 1, 0],
    ['Rental', 'home', 'income', 1, 0],
    ['Interest', 'analytics', 'income', 1, 0],
    ['Dividends', 'pie-chart', 'income', 1, 0],
    ['Gift', 'gift', 'income', 1, 0]
];

export const defaultExpenseCategories = [
    ['Others', 'remove-circle', 'expense', 1, 1],
    ['Food', 'restaurant', 'expense', 1, 0],
    ['Groceries', 'basket', 'expense', 1, 0],
    ['Fruits', 'nutrition', 'expense', 1, 0],
    ['Vegetables', 'leaf', 'expense', 1, 0],
    ['Transportation', 'car', 'expense', 1, 0],
    ['Fuel', 'speedometer', 'expense', 1, 0],
    ['Shopping', 'cart', 'expense', 1, 0],
    ['Clothes', 'shirt', 'expense', 1, 0],
    ['Bills', 'receipt', 'expense', 1, 0],
    ['Utilities', 'flashlight', 'expense', 1, 0],
    ['Rent', 'home', 'expense', 1, 0],
    ['Entertainment', 'game-controller', 'expense', 1, 0],
    ['Movies', 'film', 'expense', 1, 0],
    ['Health', 'medical', 'expense', 1, 0],
    ['Medicine', 'bandage', 'expense', 1, 0],
    ['Education', 'school', 'expense', 1, 0],
    ['Books', 'book', 'expense', 1, 0],
    ['Personal Care', 'person', 'expense', 1, 0],
    ['Salon', 'cut', 'expense', 1, 0],
    ['Household', 'home', 'expense', 1, 0],
    ['Insurance', 'shield-checkmark', 'expense', 1, 0],
    ['Travel', 'airplane', 'expense', 1, 0],
    ['Pets', 'paw', 'expense', 1, 0],
    ['Gifts', 'gift', 'expense', 1, 0],
    ['Sports', 'football', 'expense', 1, 0]
];

// Update categoryOptions based on the default categories
export const categoryOptions = {
    income: defaultIncomeCategories.map(([name, icon]) => ({
        label: name,
        value: name,
        icon: icon
    })),
    expense: defaultExpenseCategories.map(([name, icon]) => ({
        label: name,
        value: name,
        icon: icon
    }))
};

import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';

const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        // Check if we already have permission
        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );

        if (hasPermission) return true;

        // Request permission if we don't have it
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: "Storage Permission Required",
                message: "This app needs access to your storage to save exported files.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "Grant Permission"
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.error('Permission request error:', err);
        return false;
    }
};

const generatePDFContent = (transactions) => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const tableRows = transactions.map(t => `
        <tr>
            <td>${t.date}</td>
            <td>${t.title}</td>
            <td>${t.amount}</td>
            <td>${t.type}</td>
            <td>${t.category}</td>
            <td>${t.account}</td>
            <td>${t.description || ''}</td>
        </tr>
    `).join('');

    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>Transaction Report</h1>
                <p>Generated on ${new Date().toLocaleString()}</p>
                
                <div class="summary">
                    <p>Total Income: ₹${totalIncome.toFixed(2)}</p>
                    <p>Total Expense: ₹${totalExpense.toFixed(2)}</p>
                    <p>Net Balance: ₹${(totalIncome - totalExpense).toFixed(2)}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Account</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
        </html>
    `;
};

const generateCSVContent = (transactions) => {
    const headers = ['Date', 'Title', 'Amount', 'Type', 'Category', 'Account', 'Description'];
    const rows = transactions.map(t => [
        t.date,
        t.title,
        t.amount,
        t.type,
        t.category,
        t.account,
        t.description || ''
    ]);

    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
};

export const exportAsCSV = async (transactions) => {
    try {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert(
                'Permission Required',
                'This app needs storage access to save files. Please grant permission to continue.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Grant Permission',
                        onPress: async () => {
                            const granted = await requestStoragePermission();
                            if (granted) {
                                // Retry export after permission is granted
                                exportAsCSV(transactions);
                            }
                        }
                    }
                ]
            );
            return;
        }

        const csvContent = generateCSVContent(transactions);
        const fileName = `transactions_${Date.now()}.csv`;
        const downloadPath = `${RNFS.DownloadDirectoryPath}/MyExpenseManager`;
        const filePath = `${downloadPath}/${fileName}`;

        // Create directory if it doesn't exist
        await RNFS.mkdir(downloadPath);
        await RNFS.writeFile(filePath, csvContent, 'utf8');

        Alert.alert(
            'File Saved',
            `File saved to:\n${filePath}`,
            [
                { text: 'OK' },
                {
                    text: 'Share',
                    onPress: () => Share.open({
                        url: `file://${filePath}`,
                        type: 'text/csv',
                        filename: fileName
                    })
                }
            ]
        );

        return filePath;
    } catch (error) {
        console.error('CSV Export error:', error);
        Alert.alert('Export Error', 'Failed to save CSV file.');
        throw error;
    }
};

export const exportAsPDF = async (transactions) => {
    try {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert(
                'Permission Required',
                'This app needs storage access to save files. Please grant permission to continue.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Grant Permission',
                        onPress: async () => {
                            const granted = await requestStoragePermission();
                            if (granted) {
                                // Retry export after permission is granted
                                exportAsPDF(transactions);
                            }
                        }
                    }
                ]
            );
            return;
        }

        const fileName = `transactions_${Date.now()}`;
        const downloadPath = `${RNFS.DownloadDirectoryPath}/MyExpenseManager`;
        const filePath = `${downloadPath}/${fileName}.pdf`;

        await RNFS.mkdir(downloadPath);

        const options = {
            html: generatePDFContent(transactions),
            fileName,
            directory: downloadPath,
        };

        const file = await RNHTMLtoPDF.convert(options);
        
        if (!file.filePath) {
            throw new Error('PDF generation failed');
        }

        Alert.alert(
            'File Saved',
            `File saved to:\n${file.filePath}`,
            [
                { text: 'OK' },
                {
                    text: 'Share',
                    onPress: () => Share.open({
                        url: `file://${file.filePath}`,
                        type: 'application/pdf',
                        filename: `${fileName}.pdf`
                    })
                }
            ]
        );

        return file.filePath;
    } catch (error) {
        console.error('PDF Export error:', error);
        Alert.alert('Export Error', 'Failed to save PDF file.');
        throw error;
    }
};

import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';

export const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        const writeGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: "Storage Write Permission Required",
                message: "This app needs access to your storage to save files.",
                buttonPositive: "Grant Permission"
            }
        );

        const readGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
                title: "Storage Read Permission Required",
                message: "This app needs access to your storage to read backup files.",
                buttonPositive: "Grant Permission"
            }
        );

        return writeGranted === PermissionsAndroid.RESULTS.GRANTED && readGranted === PermissionsAndroid.RESULTS.GRANTED;
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

const generateTempPath = (extension) => {
    const fileName = `temp_${Date.now()}.${extension}`;
    return `${RNFS.CachesDirectoryPath}/${fileName}`;
};

export const generatePDFPreview = async (transactions) => {
    try {
        const options = {
            html: generatePDFContent(transactions),
            fileName: `temp_${Date.now()}`,
            directory: 'Cache'
        };

        const file = await RNHTMLtoPDF.convert(options);
        return file.filePath;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
};

export const savePDFToDownloads = async (tempFilePath) => {
    try {
        const downloadPath = `${RNFS.DownloadDirectoryPath}/ArthaLekha`;
        const fileName = `transactions_${Date.now()}.pdf`;
        const finalPath = `${downloadPath}/${fileName}`;

        // Create directory if doesn't exist
        await RNFS.mkdir(downloadPath);
        
        // Copy from temp to downloads
        await RNFS.copyFile(tempFilePath, finalPath);
        
        // Delete temp file
        await RNFS.unlink(tempFilePath);

        return finalPath;
    } catch (error) {
        console.error('Error saving PDF:', error);
        throw error;
    }
};

export const generateExcelPreview = async (transactions) => {
    const csvContent = generateCSVContent(transactions);
    const tempPath = generateTempPath('csv');
    await RNFS.writeFile(tempPath, csvContent, 'utf8');
    return tempPath;
};

export const saveExcelToDownloads = async (tempFilePath) => {
    try {
        const downloadPath = `${RNFS.DownloadDirectoryPath}/ArthaLekha`;
        const fileName = `transactions_${Date.now()}.csv`;
        const finalPath = `${downloadPath}/${fileName}`;

        await RNFS.mkdir(downloadPath);
        await RNFS.copyFile(tempFilePath, finalPath);
        await RNFS.unlink(tempFilePath);

        return finalPath;
    } catch (error) {
        console.error('Error saving Excel:', error);
        throw error;
    }
};

export const exportAsCSV = async (transactions) => {
    try {
        const tempPath = await generateExcelPreview(transactions);

        Alert.alert(
            'File Ready',
            'The file is ready to be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async () => {
                        try {
                            const savedPath = await saveExcelToDownloads(tempPath);
                            Alert.alert(
                                'File Saved',
                                `File saved to:\n${savedPath}`,
                                [
                                    { text: 'OK' },
                                    {
                                        text: 'Share',
                                        onPress: () => Share.open({
                                            url: `file://${savedPath}`,
                                            type: 'text/csv',
                                            filename: savedPath.split('/').pop()
                                        })
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error saving file:', error);
                            Alert.alert('Save Error', 'Failed to save the file.');
                        }
                    }
                }
            ]
        );

        return tempPath;
    } catch (error) {
        console.error('CSV Export error:', error);
        Alert.alert('Export Error', 'Failed to prepare CSV file.');
        throw error;
    }
};

export const exportAsPDF = async (transactions) => {
    try {
        const tempPath = await generatePDFPreview(transactions);

        Alert.alert(
            'File Ready',
            'The file is ready to be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async () => {
                        try {
                            const savedPath = await savePDFToDownloads(tempPath);
                            Alert.alert(
                                'File Saved',
                                `File saved to:\n${savedPath}`,
                                [
                                    { text: 'OK' },
                                    {
                                        text: 'Share',
                                        onPress: () => Share.open({
                                            url: `file://${savedPath}`,
                                            type: 'application/pdf',
                                            filename: savedPath.split('/').pop()
                                        })
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Error saving file:', error);
                            Alert.alert('Save Error', 'Failed to save the file.');
                        }
                    }
                }
            ]
        );

        return tempPath;
    } catch (error) {
        console.error('PDF Export error:', error);
        Alert.alert('Export Error', 'Failed to prepare PDF file.');
        throw error;
    }
};

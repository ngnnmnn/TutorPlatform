const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'assets', 'Danh sách hsinh .xlsx');
const wb = XLSX.readFile(filePath);
console.log('Sheet names:', wb.SheetNames);

for (const sheetName of wb.SheetNames) {
    console.log('\n=== Sheet:', sheetName, '===');
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    data.forEach((row, i) => console.log('Row ' + i + ':', JSON.stringify(row)));
}

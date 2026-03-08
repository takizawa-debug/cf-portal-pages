const XLSX = require('xlsx');

// Create a new workbook
const wb = XLSX.utils.book_new();

// Add some dummy data
const wsData = [
    ["項目名", "特産品", "おすすめ度", "備考"],
    ["りんご", "飯綱町のシナノスイート", "★★★★★", "秋の味覚として人気絶大"],
    ["もも", "川中島白桃", "★★★★☆", "夏におすすめ"],
    ["そば", "信州そば", "★★★★★", "通年楽しめる"]
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
XLSX.utils.book_append_sheet(wb, ws, "特産品リスト");

// Write to file
XLSX.writeFile(wb, "dummy.xlsx");
console.log("dummy.xlsx created.");

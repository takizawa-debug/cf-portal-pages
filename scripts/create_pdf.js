const fs = require('fs');
const PDFDocument = require('pdfkit');

// Generate a dummy PDF
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('dummy.pdf'));
doc.fontSize(25).text('飯綱町の特産品はりんごです。', 100, 100);
doc.end();

console.log("PDF generated.");

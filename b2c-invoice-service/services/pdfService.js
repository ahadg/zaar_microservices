const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = (data, template, outputPath) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '..', 'output', outputPath);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(12).text(`Template: ${template.name}`);
  doc.moveDown();
  doc.text(`Data: ${JSON.stringify(data, null, 2)}`);

  doc.end();

  return filePath;
};

module.exports = { generatePDF };

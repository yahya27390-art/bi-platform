const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:\\Users\\PC\\Desktop\\التقرير المخزون اخر نسخه.pdf';
const buf = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(buf);

async function run() {
  try {
    const parser = new PDFParse(uint8);
    console.log('Parser instance created');
    await parser.load();
    console.log('Loaded');
    const info = await parser.getInfo();
    console.log('Info:', info);
    const text = await parser.getText();
    console.log('Total text pages:', text.pages.length);
    console.log('Page 0 keys:', Object.keys(text.pages[0]));
    console.log('Page 0 text sample:\n', text.pages[0].text);
  } catch (e) {
    console.error('Error:', e);
  }
}
run();

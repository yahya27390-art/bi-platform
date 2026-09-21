const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:\\Users\\PC\\Desktop\\التقرير المخزون اخر نسخه.pdf';
const buf = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(buf);

async function run() {
  const parser = new PDFParse(uint8);
  await parser.load();
  const text = await parser.getText();
  
  console.log('Page 22 Text:');
  const lines = text.pages[21].text.split('\n').map((l, i) => `${i}: ${l}`);
  console.log(lines.join('\n'));
}

run();

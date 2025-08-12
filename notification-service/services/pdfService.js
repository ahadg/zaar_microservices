const PDFDocument = require('pdfkit');
const fs = require('fs');
const { readFileSync } = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { writeFile } = require('fs/promises');
// const { uploadBase64Attachment } = require('../helpers/blobStorage');
// const { scramble } = require('../helpers/scramble');
// const encryptionServ = require('../services/encryptionService');
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

const scramble = (str) => {
  try {
    const date = Date.parse(str).toString();
    return date;
  } catch (err) {
    console.log(err, "Error");
  }
};

function numberWithComma(x) {
  if (typeof x == "string") {
    let number = parseFloat(x.replace(/,/g, "")).toFixed(2);
    let string = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return string;
  } else {
    let number = parseFloat(x).toFixed(2);
    let string = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return string;
  }
}

const pdfold = async (invoice) => {
  try {
    // console.log(invoice)
    const scr = scramble(invoice.creationDate);
    console.log("scr", Number(scr));
    invoice.netAmt = invoice.netAmt - Number(scr);
    invoice.totalAmt = (Number(invoice.totalAmt) - Number(scr)).toString();
    invoice.totalDiscountAmt = (
      Number(invoice.totalDiscountAmt) - Number(scr)
    ).toString();
    invoice.totalTaxAmt = (
      Number(invoice.totalTaxAmt) - Number(scr)
    ).toString();
    invoice.netAmtFC = invoice.netAmtFC - Number(scr);
    invoice.totalAmtFC = invoice.totalAmtFC - Number(scr);
    invoice.totalTaxAmtFC = invoice.totalTaxAmtFC - Number(scr);
    invoice.totalDiscountAmtFC = invoice.totalDiscountAmtFC - Number(scr);

    // const Key = process.env.AES_KEY
    // await encryptionServ.decryptInvoice(invoice, Key);


    let selectTemplate = "template_1";
    console.log("bbb", selectTemplate);
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ],
      executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome' : undefined,
    });

    let page = await browser.newPage();
    
    // Set HTML content instead of navigating to URL
    let b = await loadTemplateOne(invoice);
    await page.setContent(`<html><head>${b.header}</head><body>Invoice Content Here</body></html>`, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      printBackground: true,
      format: "A4",
      displayHeaderFooter: b.headandfoot,
      headerTemplate: b.header,
      footerTemplate: b.footer,
      margin: b.margin,
    });
    await browser.close();
    
    // Create directory if it doesn't exist
    const invoiceDir = './invoices-pdf';
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Write PDF file
    const pdfPath = `${invoiceDir}/${invoice.inv_id}.pdf`;
    await writeFile(pdfPath, pdf);
    
    return {
      path: pdfPath,
      success: true
    };
    
    // //Invoice Pdf Code  ends here
  } catch (err) {
    console.log("INVOICE PDF ERROR => ", err);
    return {
      path: null,
      success: false,
      error: err.message
    };
  }
};


let loadTemplateOne = async (invoice) => {
 

  let invoiceNumber = invoice.inv_id;
  // if (invoiceNumber.length == 2) {
  //   invoiceNumber = "0" + invoiceNumber;
  // } else if (invoiceNumber.length == 1) {
  //   invoiceNumber = "00" + invoiceNumber;
  // }

  let logoFooterImageBase64 = readFileSync("./assets/line-logo.png", "base64");
  let cssb = [];
  cssb.push("<style>");
  cssb.push(`
  html {
    -webkit-print-color-adjust: exact;
  }
  .container {
    padding: 35px 35px;
    margin: 0px auto;
    width: 1000px;
    /* border: 2px solid black; */
    height: 100vh !important;
    display: flex;
    flex-direction: column;
  }
  .compnayLogo {
    font-size: 10px;
  }
  topHeader:{

    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-right: "30px",
    margin-left: "30px",
  }
  .header th {
    border: none !important;
  }
  .compnayLogo img {
    width: 50px;
  }
  .company-logo {
    width: 50px;
    height: 50px;
    /* border: 3px solid #5a2c66; */
    border: 2px solid #9e2654;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4px;
  }
  .company-logo span {
    font-size: 25px;
    background-color: #fff;
    color: #000;
  }
  .company-logo img {
    width: 90%;
    height: auto;
  }
  .compnayName {
    text-align: center;
  }
  .company-logo-parsed {
    text-align: center;
    width: 90%;
  }
  .invoiceNo {
    width: 100%;
    justify-content: flex-end;
    display: flex;
  }
  .invoiceNo-inv {
    font-size: 20px;
    font-weight: 600;
  }
  .invoiceNo-number {
    font-size: 15px;
    font-weight: 500;
    text-align: right;
    margin-right: 4px;
  }
  .total {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin: auto;
    justify-content: flex-end;
    font-size: 10px;
  }
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  span {
    background: #999999;
    color: #fff;
    display: inline-block;
    width: 100%;
  }
  .first-row {
    background-color: grey;
  }
  .total table td {
    width: 400px;
  }
  .total span {
    width: 100%;
  }
  .total-amount {
    padding-left: 4px;
  }
  `);
  cssb.push("</style>");
  let css = cssb.join("");
  let headerTemplateContent = `
</div><div class="container"><div class="header">`;
  // if (Seller?.businessInfo?.companyLogo) {
  //   headerTemplateContent += `<div class="compnayLogo">
  //     <img
  //       src="${Seller.businessInfo.companyLogo}"
  //       alt="Company Logo"
  //       width="100%" 
  //       height="100%"
  //     />
  //   </div>`;
  // } else if (Seller?.firstName) {
  //   headerTemplateContent += `<div class="company-logo">
  //     <span class="company-logo-parsed"> 
  //       ${
  //         Seller.firstName[0].toUpperCase() +
  //         " " +
  //         Seller.lastName[0].toUpperCase()
  //       }
  //     </span>
  //     <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
  //   </div>`;
  // } else {
    headerTemplateContent += `<div class="company-logo">
      <span class="company-logo-parsed"> 
        ${
          invoice.customer.first_name.toUpperCase() ||
          "" + " " + invoice.customer.last_name.toUpperCase() ||
          ""
        }
      </span>
      <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
    </div>`;
  // }
  headerTemplateContent =
    headerTemplateContent +
    `<div class="invoiceNo">
        <div class="invoiceNo-div">
          <div class="invoiceNo-inv">INV#</div>
          <div class="invoiceNo-number">${invoiceNumber}</div>
        </div>
    </div>
  </div>        
  </div>        
`;
  let header = css + headerTemplateContent;
  let footer =
    css +
    `
<div class="container">
<div class="total">
<table>
  <tr class="total-amount">
    <span>Total Amount</span>
  </tr>
  <tr>
    <td></td>
    <td>Total (Excluding TAX)</td>
    <td>${numberWithComma(invoice.subtotal_price) + " " + invoice.currency}</td>
  </tr>
  <tr>
    <td></td>
    <td>Discount</td>
    <td>${
      numberWithComma(invoice.totalDiscountAmt) + " " + invoice.currency
    }</td>
  </tr>
  <tr>
    <td></td>
    <td>TAX</td>
    <td>${
      numberWithComma(invoice.total_tax) + " " + invoice.currency
    }</td>
  </tr>
  <tr>
    <td></td>
    <td>Total Amount Due</td>
    <td>${numberWithComma(invoice.total_price) + " " + invoice.currency.code}</td>
  </tr>
</table>
</div>
</div>
`;
  let headandfoot = true;
  let margin = {
    top: "180px",
    bottom: "200px",
    right: "30px",
    left: "30px",
  };
  return { header, footer, headandfoot, margin };
};

let loadTemplateTwo = async (invoice) => {
 
  let invoiceNumber = invoice.invoiceId;
  // if (invoiceNumber.length == 2) {
  //   invoiceNumber = "0" + invoiceNumber;
  // } else if (invoiceNumber.length == 1) {
  //   invoiceNumber = "00" + invoiceNumber;
  // }

  let logoFooterImageBase64 = readFileSync("./assets/line-logo.png", "base64");

  let cssb = [];
  cssb.push("<style>");
  cssb.push(`
  html {
    -webkit-print-color-adjust: exact;
  }
  .container {
    padding: 35px 35px;
    margin: 0px auto;
    width: 1000px;
    /* border: 2px solid black; */
    height: 100vh !important;
    display: flex;
    flex-direction: column;
  }
  .pdfHeader {
    width: 100%;
    height: 40px;
    /* border: 3px solid #5a2c66; */
    border: 2px solid #9e2654;
  }
  .compnayLogo {
    font-size: 10px;
  }
  .page-header {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .page-header-invoiceId {
    text-align: right;
    width: 100%;
    font-size: 12rem;
    font-weight: 500;
  }
  .header th {
    border: none !important;
  }
  .compnayLogo {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .compnayLogo img {
    max-width: 100px;
    max-width: 100px;
  }
  .compnayName {
    margin-left: 8px;
    font-size: 12rem;
    font-weight: 500;
  }
  .custom-company-logo {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .company-logo {
    width: 50px;
    height: 50px;
    /* border: 3px solid #5a2c66; */
    border: 2px solid #9e2654;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4px;
  }
  .company-logo span {
    font-size: 25px;
    background-color: #fff;
    color: #000;
  }
  .company-logo img {
    width: 90%;
    height: auto;
  }
  .company-logo-parsed {
    text-align: center;
    width: 90%;
  }
  .invoiceNo {
    width: 100%;
    justify-content: flex-end;
    display: flex;
  }
  .invoiceNo-inv {
    font-size: 20px;
    font-weight: 600;
  }
  .invoiceNo-number {
    font-size: 15px;
    font-weight: 500;
    text-align: right;
    margin-right: 4px;
  }
  .total {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin: auto;
    justify-content: flex-end;
    font-size: 10px;
  }
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  span {
    background: #999999;
    color: #fff;
    display: inline-block;
    width: 100%;
  }
  .first-row {
    background-color: grey;
  }
  .total table td {
    width: 400px;
  }
  .total span {
    width: 100%;
  }
  .total-amount {
    padding-left: 4px;
  }
  .text-blue {
    color: #478fcc !important;
  }
  .text-grey-m1 {
    color: #484b51 !important;
  }
  `);
  cssb.push("</style>");
  let css = cssb.join("");

  let headerTemplateContent = `<div class="container">
  <div class="page-header">`;

  if (Seller?.businessInfo?.companyLogo) {
    headerTemplateContent += `<div class="compnayLogo">
      <img
        src="${Seller.businessInfo.companyLogo}"
        alt="Company Logo"
        width="100%" 
        height="100%"
      />
    </div>`;
  } else if (Seller?.firstName) {
    headerTemplateContent += `<div class="company-logo">
      <span class="company-logo-parsed"> 
        ${
          Seller.firstName[0].toUpperCase() +
          " " +
          Seller.lastName[0].toUpperCase()
        }
      </span>
      <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
    </div>`;
  } else {
    headerTemplateContent += `<div class="company-logo">
      <span class="company-logo-parsed"> 
        ${
          invoice.clientFirstName[0].toUpperCase() ||
          "" + " " + invoice.clientLastName[0].toUpperCase() ||
          ""
        }
      </span>
      <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
    </div>`;
  }

  headerTemplateContent =
    headerTemplateContent +
    `
      <div class="page-header-invoiceId text-blue">
        Invoice ID# ${invoiceNumber}
      </div>
    `;

  headerTemplateContent =
    headerTemplateContent +
    `
    </div>
  </div>        
`;
  let header = css + headerTemplateContent;
  let footer = `<p></p>`;
  let headandfoot = true;
  let margin = {
    top: "260px",
    bottom: "200px",
    right: "30px",
    left: "30px",
  };
  return { header, footer, headandfoot, margin };
};

let loadTemplateThree = async (invoice) => {
 
  let invoiceNumber = invoice.invoiceId;
  // if (invoiceNumber.length == 2) {
  //   invoiceNumber = "0" + invoiceNumber;
  // } else if (invoiceNumber.length == 1) {
  //   invoiceNumber = "00" + invoiceNumber;
  // }

  let logoFooterImageBase64 = readFileSync("./assets/line-logo.png", "base64");

  let cssb = [];
  cssb.push("<style>");
  cssb.push(`
  html {
    -webkit-print-color-adjust: exact;
  }
  .container {
    padding: 35px 35px;
    margin: 0px auto;
    width: 1000px;
    /* border: 2px solid black; */
    height: 100vh !important;
    display: flex;
    flex-direction: column;
  }
  .compnayLogo {
    font-size: 10px;
  }
  .header {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .page-header-invoiceId {
    width: 100%;
    font-size: 12rem;
    font-weight: 500;
  }
  .header th {
    border: none !important;
  }
  .compnayLogo {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .compnayLogo img {
    max-width: 100px;
    max-width: 100px;
  }
  .compnayName {
    margin-left: 8px;
    font-size: 12rem;
    font-weight: 500;
  }
  .custom-company-logo {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .pdfHeader {
    width: 100%;
    height: 40px;
    /* border: 3px solid #5a2c66; */
    border: 2px solid #9e2654;
  }
  .company-logo {
    width: 50px;
    height: 50px;
    /* border: 3px solid #5a2c66; */
    border: 2px solid #9e2654;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4px;
  }
  .company-logo span {
    font-size: 25px;
    background-color: #fff;
    color: #000;
  }
  .company-logo img {
    width: 90%;
    height: auto;
  }
  .company-logo-parsed {
    text-align: center;
    width: 90%;
  }
  .invoiceNo {
    width: 100%;
    justify-content: flex-end;
    display: flex;
  }
  .invoiceNo-inv {
    font-size: 20px;
    font-weight: 600;
  }
  .invoiceNo-number {
    font-size: 15px;
    font-weight: 500;
    text-align: right;
    margin-right: 4px;
  }
  .total {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin: auto;
    justify-content: flex-end;
    font-size: 10px;
  }
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  span {
    background: #999999;
    color: #fff;
    display: inline-block;
    width: 100%;
  }
  .first-row {
    background-color: grey;
  }
  .total table td {
    width: 400px;
  }
  .total span {
    width: 100%;
  }
  .total-amount {
    padding-left: 4px;
  }
  .text-blue {
    color: #478fcc !important;
  }
  .text-grey-m1 {
    color: #484b51 !important;
  }
  `);
  cssb.push("</style>");
  let css = cssb.join("");

  let headerTemplateContent = `<div class="container">`;
  headerTemplateContent =
    headerTemplateContent +
    `
      <div class="page-header-invoiceId text-blue">
        Invoice ID# ${invoiceNumber}
      </div>
    `;

  if (Seller?.businessInfo?.companyLogo) {
    headerTemplateContent += `<div class="compnayLogo">
        <img
          src="${Seller.businessInfo.companyLogo}"
          alt="Company Logo"
          width="100%" 
          height="100%"
        />
      </div>`;
  } else if (Seller?.firstName) {
    headerTemplateContent += `<div class="company-logo">
        <span class="company-logo-parsed"> 
          ${
            Seller.firstName[0].toUpperCase() +
            " " +
            Seller.lastName[0].toUpperCase()
          }
        </span>
        <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
      </div>`;
  } else {
    headerTemplateContent += `<div class="company-logo">
        <span class="company-logo-parsed"> 
          ${
            invoice.clientFirstName[0].toUpperCase() ||
            "" + " " + invoice.clientLastName[0].toUpperCase() ||
            ""
          }
        </span>
        <img src="data:image/png;base64,${logoFooterImageBase64}" alt="line" />
      </div>`;
  }

  headerTemplateContent =
    headerTemplateContent +
    `
  </div>        
`;
  let header = css + headerTemplateContent;
  let footer = `<p></p>`;
  let headandfoot = false;
  let margin = {
    top: "0px",
    bottom: "0px",
    right: "30px",
    left: "30px",
  };
  return { header, footer, headandfoot, margin };
};

module.exports = { pdfold, generatePDF };

const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');
const converter = require('json-2-csv');

module.exports = {
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
  async renderInvoice(order, orderDetail) {
    const invoiceFolderPath = 'src/public/invoice';
    const fileName = `invoice-${order._id}.pdf`;
    const filePath = path.join(invoiceFolderPath, fileName);
    const fontPath = 'src/fonts/Roboto-Regular.ttf';
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc
      .font(fontPath)
      .fontSize(20)
      .text('Hoá đơn thanh toán iSmart', { align: 'center' });
    doc.moveDown();
    doc.font(fontPath).text(`Thông tin khách hàng:`);
    doc.font(fontPath).fontSize(12).text(`Tên: ${order.fullname}`);
    doc.font(fontPath).fontSize(12).text(`Địa chỉ: ${order.address}`);
    doc.font(fontPath).fontSize(12).text(`Email: ${order.email}`);
    doc.font(fontPath).fontSize(12).text(`Số điện thoại: ${order.phone}`);
    doc.moveDown();
    doc.font(fontPath).text(`Thông tin đơn hàng:`);
    const totalAmount = orderDetail.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
    const table = {
      headers: ['Tên sản phẩm', 'Số lượng', 'Giá', 'Thành tiền'],
      rows: orderDetail.map((item) => [
        item.productID.name,
        item.quantity,
        item.price,
        item.quantity * item.price,
      ]),
    };
    table.rows.push(['Tổng tiền', '', '', totalAmount]);
    const tableOptions = {
      prepareHeader: () => doc.font(fontPath).fontSize(12).fillColor('black'),
      prepareRow: (row, i) =>
        doc.font(fontPath).fontSize(10).fillColor('black'),
    };
    await doc.table(table, {
      width: 300,
      columnsSize: [200, 100, 100, 100],
      ...tableOptions,
    });
    doc.moveDown();
    doc
      .font(fontPath)
      .text(`Ngày lập hoá đơn: ${order.createdAt}`, { align: 'right' });
    // done!
    doc.end();
    return filePath;
  },
  async renderCSV(products) {
    const csv = converter.json2csv(products);
    const CSVFolderPath = 'src/public/csv';
    const fileName = `export.csv`;
    const filePath = path.join(CSVFolderPath, fileName);
    await fs.promises.writeFile(filePath, csv);
    return { filePath, fileName };
  },
};

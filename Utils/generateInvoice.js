import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoicePDF = (order, res = null, filePath = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      let stream;
      if (filePath) {
        stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
      } else if (res) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename=invoice-${order.orderNo}.pdf`
        );
        doc.pipe(res);
      }

      // ---------- Header ----------
      doc
        .fillColor("#f80") // orange color
        .fontSize(22)
        .text("Food Delivery Invoice", { align: "center", underline: true })
        .moveDown(1);

      // ---------- Order & Customer Info ----------
      doc.fillColor("black").fontSize(12);
      doc.text(`Invoice #: ${order.orderNo}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`Customer: ${order.user?.name || "N/A"}`);
      doc.text(`Email: ${order.user?.email || "N/A"}`);
      doc.text(`Phone: ${order.user?.phone || "N/A"}`);
      doc.moveDown(1);

      // ---------- Items ----------
      doc.fillColor("#f80").fontSize(14).text("Items", { underline: true });
      doc.moveDown(0.5);

      doc.fillColor("black").fontSize(12);
      order.items.forEach((item, idx) => {
        const variationPrice = item.variation?.price || 0;
        const addonsPrice =
          item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
        const totalItemPrice =
          item.qty * (item.unitPrice + variationPrice + addonsPrice);

        doc.text(
          `${idx + 1}. ${item.name} (${item.qty}x) - ₹${totalItemPrice.toFixed(2)}`
        );

        if (item.variation?.name) {
          doc.text(`   • Variation: ${item.variation.name} (+₹${variationPrice})`);
        }
        if (item.addons?.length) {
          item.addons.forEach((addon) => {
            doc.text(`   • Add-on: ${addon.name} (+₹${addon.price})`);
          });
        }
        doc.moveDown(0.3);
      });

      // ---------- Charges ----------
      doc.moveDown(1);
      doc.fillColor("black").fontSize(12);
      doc.text(`Subtotal: ₹${order.charges.subTotal.toFixed(2)}`);
      doc.text(`Discount: -₹${order.charges.discount.toFixed(2)}`);
      doc.text(`Tax: ₹${order.charges.tax.toFixed(2)}`);
      doc.text(`Delivery Fee: ₹${order.charges.deliveryFee.toFixed(2)}`);

      doc.moveDown(0.5);
      doc.fillColor("#f80").fontSize(16).text(
        `Grand Total: ₹${order.charges.grandTotal.toFixed(2)}`,
        { underline: true }
      );

      // ---------- Footer ----------
      doc.moveDown(2);
      doc
        .fillColor("black")
        .fontSize(10)
        .text("Thank you for ordering from our restaurant!", { align: "center" })
        .text("For any queries, contact support@example.com", { align: "center" });

      doc.end();

      if (filePath) {
        stream.on("finish", () => resolve(filePath));
      } else if (res) {
        res.on("finish", () => resolve(true));
      }
    } catch (error) {
      reject(error);
    }
  });
};

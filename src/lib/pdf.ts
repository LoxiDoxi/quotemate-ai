import jsPDF from "jspdf";

type LineItem = {
  description: string;
  quantity?: string;
  unitPrice?: string;
  total?: string;
};

type PDFData = {
  businessName: string;
  logoUrl?: string;
  abn?: string;
  phone?: string;
  email?: string;
  address?: string;

  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  quoteNumber: string;
  quoteDate: string;

  title: string;
  scopeOfWork: string[];
  materials: LineItem[];
  labor: LineItem[];

  termsAndConditions: string[];

  subtotal?: string;
  gst?: string;
  estimatedTotal?: string;
  };

export function generatePDF(data: PDFData) {
  const doc = new jsPDF();

  let y = 45;

  function addText(text: string, size = 11, bold = false) {
    doc.setFontSize(size);

    if (bold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    doc.text(text, 20, y);
    y += 7;
  }

  // Business Header

if (data.logoUrl) {
  try {
    doc.addImage(data.logoUrl, "PNG", 20, 10, 45, 20);
  } catch {
    console.log("Logo failed");
  }
}

doc.setFontSize(20);
doc.setFont("helvetica", "bold");
doc.text(data.businessName, 75, 20);

doc.setFontSize(11);
doc.setFont("helvetica", "normal");

let headerY = 32;

if (data.abn) {
  doc.text(`ABN: ${data.abn}`, 75, headerY);
  headerY += 6;
}

if (data.phone) {
  doc.text(`Phone: ${data.phone}`, 75, headerY);
  headerY += 6;
}

if (data.email) {
  doc.text(`Email: ${data.email}`, 75, headerY);
  headerY += 6;
}

if (data.address) {
  doc.text(`Address: ${data.address}`, 75, headerY);
}

doc.line(20, 60, 190, 60);

y = headerY + 15;

  // Quote Information
  addText("QUOTE", 18, true);
  addText(`Quote Number: ${data.quoteNumber}`);
  addText(`Date: ${data.quoteDate}`);

  y += 5;

  // Customer Details
  addText("Customer Details", 14, true);
  addText(`Name: ${data.customerName}`);

  if (data.customerPhone) {
    addText(`Phone: ${data.customerPhone}`);
  }

  if (data.customerEmail) {
    addText(`Email: ${data.customerEmail}`);
  }

  if (data.customerAddress) {
    addText(`Address: ${data.customerAddress}`);
  }

  y += 8;

  // Job Title
  addText(data.title, 15, true);

  y += 3;

  // Scope
  addText("Scope of Work", 14, true);

  data.scopeOfWork.forEach((item) => {
    addText(`• ${item}`);
  });

  // Materials
  if (data.materials.length > 0) {
    y += 5;

    addText("Materials", 14, true);

    data.materials.forEach((item) => {
      addText(
        `${item.description} | Qty: ${item.quantity ?? "-"} | ${item.total ?? ""}`
      );
    });
  }

  // Labour
  if (data.labor.length > 0) {
    y += 5;

    addText("Labour", 14, true);

    data.labor.forEach((item) => {
      addText(
        `${item.description} | ${item.quantity ?? ""} | ${item.total ?? ""}`
      );
    });
  }


  // Total
if (data.estimatedTotal) {
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  doc.line(20, y, 190, y);

  y += 10;

  doc.text("ESTIMATED TOTAL", 20, y);

  doc.setFontSize(18);
  doc.text(`$${data.estimatedTotal}`, 150, y);

  y += 10;

  doc.line(20, y, 190, y);

  y += 10;
}


  // Terms
  y += 8;

  addText("Terms and Conditions", 14, true);

  data.termsAndConditions.forEach((term, index) => {
    addText(`${index + 1}. ${term}`);
  });


  // Footer
  y += 10;

  doc.setFontSize(9);
  doc.text(
    "Thank you for your business.",
    20,
    y
  );


  doc.save(`Quote-${data.quoteNumber}.pdf`);
}
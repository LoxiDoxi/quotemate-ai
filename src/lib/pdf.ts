import jsPDF from "jspdf";

type LineItem = {
  description: string;
  quantity?: string;
  unitPrice?: string;
  total?: string;
};

type PDFData = {
  businessName: string;
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

  estimatedTotal?: string;
};

export function generatePDF(data: PDFData) {
  const doc = new jsPDF();
doc.setFontSize(16);
doc.text(data.businessName, 20, 20);

doc.setFontSize(10);

if (data.abn) {
  doc.text(`ABN: ${data.abn}`, 20, 28);
}

if (data.phone) {
  doc.text(`Phone: ${data.phone}`, 20, 34);
}

if (data.email) {
  doc.text(`Email: ${data.email}`, 20, 40);
}

if (data.address) {
  doc.text(`Address: ${data.address}`, 20, 46);
}


doc.setFontSize(16);
doc.text(data.businessName, 20, 20);

doc.setFontSize(10);

if (data.abn) {
  doc.text(`ABN: ${data.abn}`, 20, 28);
}

if (data.phone) {
  doc.text(`Phone: ${data.phone}`, 20, 34);
}

if (data.email) {
  doc.text(`Email: ${data.email}`, 20, 40);
}

if (data.address) {
  doc.text(`Address: ${data.address}`, 20, 46);
}
  let y = 20;

  function addLine(text: string, size = 11) {
    doc.setFontSize(size);
    doc.text(text, 20, y);
    y += 7;
  }

  addLine(data.businessName, 22);

  if (data.abn) addLine(`ABN: ${data.abn}`);
  if (data.phone) addLine(`Phone: ${data.phone}`);
  if (data.email) addLine(`Email: ${data.email}`);
  if (data.address) addLine(`Address: ${data.address}`);

  y += 5;

  addLine("QUOTE", 18);
  addLine(`Quote Number: ${data.quoteNumber}`);
  addLine(`Date: ${data.quoteDate}`);

  y += 5;

  addLine("Customer Details", 13);
  addLine(`Name: ${data.customerName}`);

  if (data.customerPhone) {
    addLine(`Phone: ${data.customerPhone}`);
  }

  if (data.customerEmail) {
    addLine(`Email: ${data.customerEmail}`);
  }

  if (data.customerAddress) {
    addLine(`Address: ${data.customerAddress}`);
  }

  y += 5;

  addLine(data.title, 16);

  addLine("Scope of Work", 13);

  data.scopeOfWork.forEach((item) => {
    addLine(`• ${item}`);
  });

  if (data.materials.length > 0) {
    y += 5;
    addLine("Materials", 13);

    data.materials.forEach((item) => {
      addLine(
        `${item.description} | ${item.quantity ?? ""} | ${item.total ?? ""}`,
      );
    });
  }

  if (data.labor.length > 0) {
    y += 5;
    addLine("Labour", 13);

    data.labor.forEach((item) => {
      addLine(
        `${item.description} | ${item.quantity ?? ""} | ${item.total ?? ""}`,
      );
    });
  }

  if (data.estimatedTotal) {
    y += 5;
    addLine(`Estimated Total: ${data.estimatedTotal}`, 15);
  }

  y += 5;

  addLine("Terms and Conditions", 13);

  data.termsAndConditions.forEach((term, index) => {
    addLine(`${index + 1}. ${term}`);
  });

  doc.save(`Quote-${data.quoteNumber}.pdf`);
}
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

  let y = 20;

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
  addText(data.businessName, 20, true);

  if (data.abn) addText(`ABN: ${data.abn}`);
  if (data.phone) addText(`Phone: ${data.phone}`);
  if (data.email) addText(`Email: ${data.email}`);
  if (data.address) addText(`Address: ${data.address}`);

  y += 8;

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
    y += 8;

    addText(
      `Estimated Total: ${data.estimatedTotal}`,
      16,
      true
    );
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
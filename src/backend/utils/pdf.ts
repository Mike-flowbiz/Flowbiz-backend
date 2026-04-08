import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessSetting, Client, Invoice, InvoiceItem, Product } from '@prisma/client';

interface InvoiceWithDetails extends Invoice {
  client: Client;
  invoiceItems: (InvoiceItem & { product: Product | null })[];
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export const generateInvoicePDF = async (
  invoice: InvoiceWithDetails,
  settings: BusinessSetting | null
): Promise<Buffer> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = settings?.primaryColor || '#3B82F6';
  const textColor = '#1F2937';
  const lightTextColor = '#6B7280';

  // --- Header ---
  // Try to embed company logo; fall back to company name text
  let companyDetailsY = 30;
  if (settings?.logo) {
    const logoDataUrl = await fetchImageAsDataUrl(settings.logo);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 20, 10, 42, 15);
      companyDetailsY = 29;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryColor);
      doc.text(settings?.companyName || 'FlowBiz', 20, 20);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);
    doc.text(settings?.companyName || 'FlowBiz', 20, 20);
  }

  // Company Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);
  const companyAddress = settings?.companyAddress || '';
  const headerLines = [
    companyAddress,
    settings?.companyEmail,
    settings?.companyPhone,
  ].filter(Boolean) as string[];

  if (headerLines.length > 0) {
    doc.text(headerLines, 20, companyDetailsY);
  }

  // Invoice Title and Info (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', 190, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(lightTextColor);
  doc.text(`Invoice #:`, 160, 30, { align: 'right' });
  doc.setTextColor(textColor);
  doc.text(invoice.invoiceNumber, 190, 30, { align: 'right' });

  doc.setTextColor(lightTextColor);
  doc.text(`Issue Date:`, 160, 35, { align: 'right' });
  doc.setTextColor(textColor);
  doc.text(new Date(invoice.issueDate).toLocaleDateString('en-GB'), 190, 35, { align: 'right' });

  doc.setTextColor(lightTextColor);
  doc.text(`Due Date:`, 160, 40, { align: 'right' });
  doc.setTextColor(textColor);
  doc.text(new Date(invoice.dueDate).toLocaleDateString('en-GB'), 190, 40, { align: 'right' });

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 50, 190, 50);

  // --- Bill To ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightTextColor);
  doc.text('BILL TO', 20, 60);

  doc.setFontSize(11);
  doc.setTextColor(textColor);
  doc.text(invoice.client.name, 20, 65);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const clientDetails = [
    invoice.client.companyName,
    invoice.client.address,
    invoice.client.email,
  ].filter(Boolean) as string[];
  doc.text(clientDetails, 20, 70);

  // --- Items Table ---
  const tableData = invoice.invoiceItems.map((item) => [
    item.description,
    item.quantity.toString(),
    `£${item.unitPrice.toFixed(2)}`,
    `£${item.amount.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#FFFFFF',
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  const lastY = (doc as any).lastAutoTable.finalY + 10;

  // --- Totals ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 150, lastY, { align: 'right' });
  doc.text(`£${invoice.subtotal.toFixed(2)}`, 190, lastY, { align: 'right' });

  doc.text(`VAT (${invoice.vatRate}%):`, 150, lastY + 5, { align: 'right' });
  doc.text(`£${invoice.vatAmount.toFixed(2)}`, 190, lastY + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 150, lastY + 15, { align: 'right' });
  doc.text(`£${invoice.total.toFixed(2)}`, 190, lastY + 15, { align: 'right' });

  // --- Footer / Notes ---
  if (invoice.notes) {
    const footerY = lastY + 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightTextColor);
    doc.text('NOTES', 20, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(invoice.notes, 20, footerY + 5, { maxWidth: 100 });
  }

  if (settings?.bankName) {
    const bankY = lastY + (invoice.notes ? 60 : 30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightTextColor);
    doc.text('BANK DETAILS', 20, bankY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(`Bank: ${settings.bankName}`, 20, bankY + 5);
    doc.text(`Account: ${settings.accountNumber}`, 20, bankY + 10);
    doc.text(`Sort Code: ${settings.sortCode}`, 20, bankY + 15);
  }

  // --- Final Text ---
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};

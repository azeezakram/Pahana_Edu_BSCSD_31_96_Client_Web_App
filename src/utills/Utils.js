import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const printBill = (salesHistory) => {
	if (!salesHistory || !salesHistory.salesItems?.length) {
		alert('No items to print!');
		return;
	}

	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();

	// --- HEADER ---
	doc.setFontSize(18);
	doc.setFont('helvetica', 'bold');
	doc.text('Pahana Edu', pageWidth / 2, 20, { align: 'center' });

	doc.setFontSize(12);
	doc.setFont('helvetica', 'normal');
	doc.text('Bill Summary', pageWidth / 2, 28, { align: 'center' });

	// --- Fake Address below header ---
	// --- Fake Address & Landline below header ---
	doc.setFontSize(10);
	doc.setFont('helvetica', 'normal');
	doc.text('123 Main Street, Colombo 03, Sri Lanka', pageWidth / 2, 34, {
		align: 'center',
	});
	doc.text('Tel: 011 234 5678', pageWidth / 2, 38, { align: 'center' });

	// Draw a line under header & address
	doc.setLineWidth(0.5);
	doc.line(14, 42, pageWidth - 14, 42);

	// --- CUSTOMER INFO ---
	doc.setFontSize(11);
	doc.text(`Customer Name: ${salesHistory.customer?.name || 'N/A'}`, 14, 50);
	doc.text(`Phone: ${salesHistory.customer?.phoneNumber || 'N/A'}`, 14, 56);
	doc.text(`Address: ${salesHistory.customer?.address || 'N/A'}`, 14, 62);
	doc.text(`Bill No: ${salesHistory?.id || 'N/A'}`, pageWidth - 60, 50);
	doc.text(
		`Date: ${new Date(salesHistory?.createdAt).toLocaleString() || 'N/A'}`,
		pageWidth - 60,
		56
	);

	// --- TABLE ---
	const tableColumn = ['Item', 'Qty', 'Price', 'Subtotal'];
	const tableRows = salesHistory.salesItems.map((salesItem) => [
		salesItem.item.itemName,
		salesItem.unit,
		(salesItem.sellPrice / 100).toFixed(2),
		(salesItem.subTotal / 100).toFixed(2),
	]);

	autoTable(doc, {
		startY: 70,
		head: [tableColumn],
		body: tableRows,
		headStyles: {
			fillColor: [41, 128, 185], // modern blue
			textColor: 255,
			fontStyle: 'bold',
		},
		alternateRowStyles: { fillColor: [245, 245, 245] },
		margin: { left: 14, right: 14 },
		tableWidth: 'auto',
	});

	// --- GRAND TOTAL ---
	const finalY = doc.lastAutoTable.finalY + 10;
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.text(
		`Grand Total: ${(salesHistory.grandTotal / 100).toFixed(2)}`,
		pageWidth - 14,
		finalY,
		{ align: 'right' }
	);

	// Optional footer note
	doc.setFontSize(10);
	doc.setFont('helvetica', 'italic');
	doc.text('Thank you for your purchase!', pageWidth / 2, finalY + 10, {
		align: 'center',
	});

	// Save PDF
	doc.save(`bill_${salesHistory.id || Date.now()}.pdf`);
};

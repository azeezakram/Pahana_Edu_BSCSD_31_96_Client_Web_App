import React, { useState, useEffect } from 'react';
import {printBill} from '../utills/Utils.js'
import {
	CheckCircleIcon,
	XCircleIcon,
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/solid';
import Loader from '../components/loader/Loader';

const BillingSectionPage = () => {
	const [customerData, setCustomerData] = useState(null);
	const [accountNumber, setAccountNumber] = useState('');
	const [customerValid, setCustomerValid] = useState(null);
	const [customerName, setCustomerName] = useState('');
	const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [items, setItems] = useState([]);
	const [filteredItems, setFilteredItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [isEditingIndex, setIsEditingIndex] = useState(null);

	const [billItems, setBillItems] = useState([]);
	const [grandTotal, setGrandTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchItems();
	}, []);

	useEffect(() => {
		calculateGrandTotal();
	}, [billItems]);

	const fetchItems = async () => {
		try {
			setIsLoading(true);
			const res = await fetch(
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/item/',
				{ credentials: 'include' }
			);
			if (res.ok) {
				const data = await res.json();
				setItems(data);
				setFilteredItems(data);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCustomerChange = async (e) => {
		const value = e.target.value.trim();
		setAccountNumber(value);
		setCustomerValid(null);
		setCustomerName('');

		if (!value) return;

		setIsCheckingCustomer(true);
		try {
			const res = await fetch(
				`http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/customer/${value}?accno=true`,
				{ credentials: 'include' }
			);
			if (res.status === 200) {
				const data = await res.json();
				setCustomerValid(true);
				setCustomerName(data.fullName || '');
				setCustomerData(data);
			} else {
				setCustomerValid(false);
			}
		} catch (err) {
			setCustomerValid(false);
		} finally {
			setIsCheckingCustomer(false);
		}
	};

	const handleSearchChange = (e) => {
		const val = e.target.value;
		setSearchTerm(val);
		setSelectedItem(null);
		const filtered = items.filter(
			(i) =>
				i.itemName.toLowerCase().includes(val.toLowerCase()) ||
				i.id.toString() === val ||
				i.description?.toLowerCase().includes(val.toLowerCase())
		);
		setFilteredItems(filtered);
	};

	const selectItemFromSearch = (item) => {
		setSelectedItem(item);
		setSearchTerm(item.itemName);
		setQuantity(1);
		setFilteredItems([]);
	};

	const addItemToBill = () => {
		if (!selectedItem || quantity <= 0) return;

		if (isEditingIndex !== null) {
			const newBill = [...billItems];
			newBill[isEditingIndex] = {
				item: selectedItem,
				sellPrice: selectedItem.price,
				unit: quantity,
				subTotal: selectedItem.price * quantity,
			};
			setBillItems(newBill);
			setIsEditingIndex(null);
		} else {
			const existingIndex = billItems.findIndex(
				(b) => b.item.id === selectedItem.id
			);
			if (existingIndex >= 0) {
				const newBill = [...billItems];
				newBill[existingIndex].unit += quantity;
				newBill[existingIndex].subTotal =
					newBill[existingIndex].unit *
					newBill[existingIndex].sellPrice;
				setBillItems(newBill);
			} else {
				setBillItems([
					...billItems,
					{
						item: selectedItem,
						sellPrice: selectedItem.price,
						unit: quantity,
						subTotal: selectedItem.price * quantity,
					},
				]);
			}
		}
		setSelectedItem(null);
		setQuantity(1);
		setSearchTerm('');
	};

	const editBillItem = (index) => {
		const b = billItems[index];
		setSelectedItem(b.item);
		setSearchTerm(b.item.itemName);
		setQuantity(b.unit);
		setIsEditingIndex(index);
	};

	const removeBillItem = (index) => {
		const newBill = [...billItems];
		newBill.splice(index, 1);
		setBillItems(newBill);
		if (isEditingIndex === index) {
			setSelectedItem(null);
			setQuantity(1);
			setSearchTerm('');
			setIsEditingIndex(null);
		}
	};

	const calculateGrandTotal = () => {
		setGrandTotal(billItems.reduce((sum, b) => sum + b.subTotal, 0));
	};

	// const printBill = (salesHistory) => {
	// 	if (!salesHistory || !salesHistory.salesItems?.length) {
	// 		alert('No items to print!');
	// 		return;
	// 	}

	// 	const doc = new jsPDF();
	// 	const pageWidth = doc.internal.pageSize.getWidth();

	// 	// --- HEADER ---
	// 	doc.setFontSize(18);
	// 	doc.setFont('helvetica', 'bold');
	// 	doc.text('Pahana Edu', pageWidth / 2, 20, { align: 'center' });

	// 	doc.setFontSize(12);
	// 	doc.setFont('helvetica', 'normal');
	// 	doc.text('Bill Summary', pageWidth / 2, 28, { align: 'center' });

	// 	// --- Fake Address below header ---
	// 	// --- Fake Address & Landline below header ---
	// 	doc.setFontSize(10);
	// 	doc.setFont('helvetica', 'normal');
	// 	doc.text('123 Main Street, Colombo 03, Sri Lanka', pageWidth / 2, 34, {
	// 		align: 'center',
	// 	});
	// 	doc.text('Tel: 011 234 5678', pageWidth / 2, 38, { align: 'center' });

	// 	// Draw a line under header & address
	// 	doc.setLineWidth(0.5);
	// 	doc.line(14, 42, pageWidth - 14, 42);

	// 	// --- CUSTOMER INFO ---
	// 	doc.setFontSize(11);
	// 	doc.text(
	// 		`Customer Name: ${salesHistory.customer?.name || 'N/A'}`,
	// 		14,
	// 		50
	// 	);
	// 	doc.text(
	// 		`Phone: ${salesHistory.customer?.phoneNumber || 'N/A'}`,
	// 		14,
	// 		56
	// 	);
	// 	doc.text(`Address: ${salesHistory.customer?.address || 'N/A'}`, 14, 62);
	// 	doc.text(`Bill No: ${salesHistory?.id || 'N/A'}`, pageWidth - 60, 50);
	// 	doc.text(
	// 		`Date: ${
	// 			new Date(salesHistory?.createdAt).toLocaleString() || 'N/A'
	// 		}`,
	// 		pageWidth - 60,
	// 		56
	// 	);

	// 	// --- TABLE ---
	// 	const tableColumn = ['Item', 'Qty', 'Price', 'Subtotal'];
	// 	const tableRows = salesHistory.salesItems.map((salesItem) => [
	// 		salesItem.item.itemName,
	// 		salesItem.unit,
	// 		(salesItem.sellPrice / 100).toFixed(2),
	// 		(salesItem.subTotal / 100).toFixed(2),
	// 	]);

	// 	autoTable(doc, {
	// 		startY: 70,
	// 		head: [tableColumn],
	// 		body: tableRows,
	// 		headStyles: {
	// 			fillColor: [41, 128, 185], // modern blue
	// 			textColor: 255,
	// 			fontStyle: 'bold',
	// 		},
	// 		alternateRowStyles: { fillColor: [245, 245, 245] },
	// 		margin: { left: 14, right: 14 },
	// 		tableWidth: 'auto',
	// 	});

	// 	// --- GRAND TOTAL ---
	// 	const finalY = doc.lastAutoTable.finalY + 10;
	// 	doc.setFontSize(12);
	// 	doc.setFont('helvetica', 'bold');
	// 	doc.text(
	// 		`Grand Total: ${(salesHistory.grandTotal / 100).toFixed(2)}`,
	// 		pageWidth - 14,
	// 		finalY,
	// 		{ align: 'right' }
	// 	);

	// 	// Optional footer note
	// 	doc.setFontSize(10);
	// 	doc.setFont('helvetica', 'italic');
	// 	doc.text('Thank you for your purchase!', pageWidth / 2, finalY + 10, {
	// 		align: 'center',
	// 	});

	// 	// Save PDF
	// 	doc.save(`bill_${salesHistory.id || Date.now()}.pdf`);
	// };

	const handleCheckout = async () => {
		if (!customerValid || billItems.length === 0) return;
		if (!window.confirm('Confirm checkout?')) return;

		const payload = {
			customerId: customerData.id,
			salesItems: billItems.map((b) => ({
				itemId: b.item.id,
				unit: b.unit,
			})),
		};

		try {
			setIsLoading(true);
			const res = await fetch(
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/sales-history/',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
					credentials: 'include',
				}
			);

			if (res.ok) {
				const createdHistory = await res.json(); // This is the saved bill from backend
				alert('Checkout successful!');
				try {
					printBill(createdHistory); // Print the official record from backend
				} catch (err) {
					console.error('Print bill error:', err);
					alert('Bill could not be printed.');
				}

				// Clear local state
				setBillItems([]);
				setAccountNumber('');
				setCustomerValid(null);
				setCustomerName('');
			} else {
				const data = await res.json();
				alert(data.error || 'Checkout failed');
			}
		} catch (err) {
			alert('Network error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='h-screen flex flex-col'>
			{/* Main content + Footer */}
			<div className='flex-1 flex flex-col'>
				{/* Scrollable content */}
				<div className='flex-1 overflow-y-auto p-6 space-y-6'>
					{/* Customer Card */}
					{/* Customer Card */}
					<div className='bg-white shadow-lg rounded-xl p-6 flex flex-col space-y-2'>
						<div className='relative flex items-center'>
							<input
								type='text'
								placeholder='Enter customer account number'
								value={accountNumber}
								onChange={handleCustomerChange}
								className='flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
							/>
							{isCheckingCustomer && (
								<span className='text-gray-500 text-sm absolute right-3 top-1/2 -translate-y-1/2'>
									Checking...
								</span>
							)}
							{customerValid === true && (
								<CheckCircleIcon className='h-6 w-6 text-green-500 absolute right-3 top-1/2 -translate-y-1/2' />
							)}
							{customerValid === false && (
								<XCircleIcon className='h-6 w-6 text-red-500 absolute right-3 top-1/2 -translate-y-1/2' />
							)}
						</div>

						{/* Show customer details under input */}
						{customerValid && customerData && (
							<div className='text-gray-700 mt-2 space-y-1'>
								<div>
									<span className='font-semibold'>
										Customer Name:
									</span>{' '}
									{customerData.fullName ||
										customerData.name ||
										'N/A'}
								</div>
								<div>
									<span className='font-semibold'>
										Phone:
									</span>{' '}
									{customerData.phoneNumber || 'N/A'}
								</div>
								<div>
									<span className='font-semibold'>
										Address:
									</span>{' '}
									{customerData.address || 'N/A'}
								</div>
							</div>
						)}
					</div>

					{/* Item Search Card */}
					<div className='bg-white shadow-lg rounded-xl p-6 space-y-4 relative'>
						<div className='flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0 relative'>
							<input
								type='text'
								placeholder='Search item by name, id, or description'
								value={searchTerm}
								onChange={handleSearchChange}
								className='flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
								disabled={!customerValid}
							/>
							<input
								type='number'
								min='1'
								value={quantity}
								onChange={(e) =>
									setQuantity(Number(e.target.value))
								}
								className='w-24 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
								disabled={!selectedItem || !customerValid}
							/>
							<button
								onClick={addItemToBill}
								disabled={!selectedItem || !customerValid}
								className='px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition cursor-pointer'>
								{isEditingIndex !== null ? 'Update' : 'Add'}
							</button>
						</div>

						{/* Floating search list */}
						{searchTerm && filteredItems.length > 0 && (
							<div className='absolute top-full left-0 right-0 mt-1 z-50 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto'>
								{filteredItems.map((i) => (
									<div
										key={i.id}
										onClick={() => selectItemFromSearch(i)}
										className={`p-3 cursor-pointer hover:bg-blue-50 transition ${
											selectedItem?.id === i.id
												? 'bg-blue-100'
												: ''
										}`}>
										<div className='font-medium'>
											{i.itemName}
										</div>
										<div className='text-gray-500 text-sm'>
											{i.description}
										</div>
										<div className='text-gray-700 text-sm font-semibold'>
											Price: {(i.price / 100).toFixed(2)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Billing Table */}
					<div className='bg-white shadow-lg rounded-xl overflow-hidden flex-1'>
						<div className='max-h-[400px] overflow-y-auto'>
							<table className='min-w-full table-auto border-collapse'>
								<thead className='bg-gray-100 sticky top-0'>
									<tr>
										<th className='px-6 py-3 text-left font-medium text-gray-700'>
											Item
										</th>
										<th className='px-4 py-3 text-center font-medium text-gray-700'>
											Quantity
										</th>
										<th className='px-4 py-3 text-right font-medium text-gray-700'>
											Price
										</th>
										<th className='px-4 py-3 text-right font-medium text-gray-700'>
											Subtotal
										</th>
										<th className='px-4 py-3 text-center font-medium text-gray-700'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{billItems.map((b, idx) => (
										<tr
											key={idx}
											className='border-t border-gray-200 hover:bg-gray-50 transition'>
											<td className='px-6 py-3'>
												{b.item.itemName}
											</td>
											<td className='px-4 py-3 text-center'>
												{b.unit}
											</td>
											<td className='px-4 py-3 text-right'>
												{(b.sellPrice / 100).toFixed(2)}
											</td>
											<td className='px-4 py-3 text-right'>
												{(b.subTotal / 100).toFixed(2)}
											</td>
											<td className='px-4 py-3 flex justify-center space-x-2'>
												<button
													onClick={() =>
														editBillItem(idx)
													}>
													<PencilIcon className='h-5 w-5 text-green-500 hover:text-green-700 transition cursor-pointer' />
												</button>
												<button
													onClick={() =>
														removeBillItem(idx)
													}>
													<TrashIcon className='h-5 w-5 text-red-500 hover:text-red-700 transition cursor-pointer' />
												</button>
											</td>
										</tr>
									))}
									{billItems.length === 0 && (
										<tr>
											<td
												colSpan='5'
												className='text-center py-6 text-gray-400'>
												No items added
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='bg-white shadow-lg p-6 flex justify-between items-center sticky bottom-0 z-20'>
					<div className='text-xl font-semibold'>
						Grand Total: {(grandTotal / 100).toFixed(2)}
					</div>
					<button
						onClick={handleCheckout}
						disabled={!customerValid || billItems.length === 0}
						className='px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition cursor-pointer'>
						Checkout
					</button>
				</div>

				{isLoading && <Loader />}
			</div>
		</div>
	);
};

export default BillingSectionPage;

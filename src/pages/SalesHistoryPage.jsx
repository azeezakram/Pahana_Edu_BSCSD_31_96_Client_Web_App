import React, { useState, useEffect } from 'react';
import { XCircleIcon, EyeIcon } from '@heroicons/react/24/solid';
import Loader from '../components/loader/Loader';
import { printBill } from '../utills/Utils';

const SalesHistoryPage = () => {
	const [salesHistories, setSalesHistories] = useState([]);
	const [filteredHistories, setFilteredHistories] = useState([]);
	const [selectedHistory, setSelectedHistory] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [sortField, setSortField] = useState('createdAt');
	const [sortOrder, setSortOrder] = useState('desc');
	const [filterCustomer, setFilterCustomer] = useState('');

	useEffect(() => {
		fetchSalesHistories();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [salesHistories, searchTerm, sortField, sortOrder, filterCustomer]);

	const fetchSalesHistories = async () => {
		try {
			setIsLoading(true);
			const res = await fetch(
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/sales-history?includeItems=true',
				{ credentials: 'include' }
			);
			if (res.ok) {
				const data = await res.json();
				setSalesHistories(data);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const applyFilters = () => {
		let data = [...salesHistories];

		// Search by customer name or bill id
		if (searchTerm) {
			data = data.filter(
				(sh) =>
					sh.customer?.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					String(sh.id).includes(searchTerm)
			);
		}

		// Filter by customer name
		if (filterCustomer) {
			data = data.filter(
				(sh) =>
					sh.customer?.name.toLowerCase() ===
					filterCustomer.toLowerCase()
			);
		}

		// Sort
		data.sort((a, b) => {
			const aVal = a[sortField];
			const bVal = b[sortField];
			if (sortField === 'createdAt') {
				return sortOrder === 'asc'
					? new Date(aVal) - new Date(bVal)
					: new Date(bVal) - new Date(aVal);
			}
			if (typeof aVal === 'number') {
				return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
			}
			if (typeof aVal === 'string') {
				return sortOrder === 'asc'
					? aVal.localeCompare(bVal)
					: bVal.localeCompare(aVal);
			}
			return 0;
		});

		setFilteredHistories(data);
	};

	return (
		<div className='h-screen flex flex-col p-6 space-y-6 bg-gray-50'>
			{/* Search & Filters */}
			<div className='flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0'>
				<input
					type='text'
					placeholder='Search by Bill ID or Customer Name'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
				/>
				<input
					type='text'
					placeholder='Filter by Customer Name'
					value={filterCustomer}
					onChange={(e) => setFilterCustomer(e.target.value)}
					className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
				/>
				<select
					value={sortField}
					onChange={(e) => setSortField(e.target.value)}
					className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'>
					<option value='createdAt'>Created At</option>
					<option value='grandTotal'>Grand Total</option>
					<option value='id'>Bill ID</option>
					<option value='customer'>Customer Name</option>
				</select>
				<select
					value={sortOrder}
					onChange={(e) => setSortOrder(e.target.value)}
					className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'>
					<option value='asc'>Ascending</option>
					<option value='desc'>Descending</option>
				</select>
			</div>

			{/* Sales history table */}
			<div className='flex-1 bg-white shadow-lg rounded-xl overflow-hidden'>
				<div className='overflow-x-auto max-h-full'>
					<table className='min-w-full table-auto border-collapse'>
						<thead className='bg-gray-100 sticky top-0'>
							<tr>
								<th className='px-6 py-3 text-left font-medium text-gray-700'>
									Bill ID
								</th>
								<th className='px-6 py-3 text-left font-medium text-gray-700'>
									Customer Name
								</th>
								<th className='px-6 py-3 text-right font-medium text-gray-700'>
									Grand Total
								</th>
								<th className='px-6 py-3 text-left font-medium text-gray-700'>
									Created At
								</th>
								<th className='px-6 py-3 text-center font-medium text-gray-700'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredHistories.length > 0 ? (
								filteredHistories.map((sh) => (
									<tr
										key={sh.id}
										className='border-t border-gray-200 hover:bg-gray-50 transition'>
										<td className='px-6 py-3'>{sh.id}</td>
										<td className='px-6 py-3'>
											{sh.customer?.name || 'N/A'}
										</td>
										<td className='px-6 py-3 text-right'>
											{(sh.grandTotal / 100).toFixed(2)}
										</td>
										<td className='px-6 py-3'>
											{new Date(
												sh.createdAt
											).toLocaleString()}
										</td>
										<td className='px-6 py-3 text-center'>
											<button
												onClick={() =>
													setSelectedHistory(sh)
												}
												className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2'>
												<EyeIcon className='h-4 w-4' />
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan='5'
										className='text-center py-6 text-gray-400'>
										No sales history available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{selectedHistory && (
				<div className='fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4'>
					<div className='bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-lg relative transform transition-all duration-300 scale-105'>
						{/* Modal header */}
						<div className='flex justify-between items-center border-b px-6 py-4 bg-gray-50'>
							<h2 className='text-2xl font-bold text-gray-800'>
								Sales Details - ID: {selectedHistory.id}
							</h2>
							<button
								onClick={() => setSelectedHistory(null)}
								className='text-gray-500 hover:text-gray-800 transition'>
								<XCircleIcon className='h-6 w-6' />
							</button>
						</div>

						{/* Customer info */}
						<div className='px-6 py-4 bg-gray-50 space-y-2 rounded-b-md text-gray-700'>
							<div>
								<span className='font-semibold'>
									Customer Name:
								</span>{' '}
								{selectedHistory.customer?.name || 'N/A'}
							</div>
							<div>
								<span className='font-semibold'>
									Account Number:
								</span>{' '}
								{selectedHistory.customer?.accountNumber ||
									'N/A'}
							</div>
							<div>
								<span className='font-semibold'>
									Created At:
								</span>{' '}
								{new Date(
									selectedHistory.createdAt
								).toLocaleString()}
							</div>
						</div>

						{/* Sales items table */}
						<div className='max-h-96 overflow-y-auto px-6 py-4'>
							<table className='min-w-full table-auto border-collapse rounded-lg'>
								<thead className='bg-gray-100 sticky top-0 z-10'>
									<tr>
										<th className='px-4 py-2 text-left font-medium text-gray-700'>
											Item ID
										</th>
										<th className='px-4 py-2 text-left font-medium text-gray-700'>
											Item Name
										</th>
										<th className='px-4 py-2 text-center font-medium text-gray-700'>
											Unit
										</th>
										<th className='px-4 py-2 text-right font-medium text-gray-700'>
											Sell Price
										</th>
										<th className='px-4 py-2 text-right font-medium text-gray-700'>
											Subtotal
										</th>
									</tr>
								</thead>
								<tbody>
									{selectedHistory.salesItems.map(
										(item, idx) => (
											<tr
												key={idx}
												className='border-t border-gray-200 hover:bg-gray-50 transition'>
												<td className='px-4 py-2'>
													{item.item?.id || 'N/A'}
												</td>
												<td className='px-4 py-2'>
													{item.item?.itemName || 'N/A'}
												</td>
												<td className='px-4 py-2 text-center'>
													{item.unit}
												</td>
												<td className='px-4 py-2 text-right'>
													{(
														item.sellPrice / 100
													).toFixed(2)}
												</td>
												<td className='px-4 py-2 text-right'>
													{(
														item.subTotal / 100
													).toFixed(2)}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>

						{/* Footer Grand Total */}
						<div className='sticky bottom-0 px-6 py-4 border-t bg-white flex justify-between flex-row-reverse text-gray-800 text-lg shadow-md'>
							<div className='font-bold'>
								Grand Total:{' '}
								{(selectedHistory.grandTotal / 100).toFixed(2)}
							</div>
							<div className='font-medium text-[0.9rem] hover:underline' onClick={() => printBill(selectedHistory)}>
								Print bill
							</div>
						</div>
					</div>
				</div>
			)}

			{isLoading && <Loader />}
		</div>
	);
};

export default SalesHistoryPage;

import React, { useEffect, useState } from 'react';
import Loader from '../components/loader/Loader';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

const CustomerManagementPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [customers, setCustomers] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Modal & form states
	const [showModal, setShowModal] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState(null);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		accountNumber: '',
		address: '',
		phoneNumber: '', // store only number without +94
	});
	const [formErrors, setFormErrors] = useState({});

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			const res = await fetch(
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/customer/',
				{ credentials: 'include' }
			);

			if (!res.ok) throw new Error('Failed to fetch customers');

			const text = await res.text(); // get raw response
			const data = text ? JSON.parse(text) : []; // parse only if not empty

			setCustomers(data);
			setIsError(false);
		} catch (e) {
			console.error('Error fetching customers:', e);
			setIsError(true);
		}
	};

	// Sort customers by id ascending before filtering
	const sortedCustomers = [...customers].sort((a, b) => a.id - b.id);

	const filteredCustomers = sortedCustomers.filter((cust) =>
		[cust.name, cust.accountNumber, cust.phoneNumber, cust.address].some(
			(field) => field.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	if (isError) {
		return (
			<h2
				className='text-center'
				style={{ padding: '10rem' }}>
				Something went wrong...
			</h2>
		);
	}

	if (!customers) {
		return (
			<h2
				className='text-center'
				style={{ padding: '10rem' }}>
				Something went wrong...
			</h2>
		);
	}

	// Delete customer handler
	const handleDelete = async (id) => {
		const confirmed = window.confirm(
			'Are you sure you want to delete this customer?'
		);
		if (!confirmed) return;

		setIsLoading(true);
		try {
			const res = await fetch(
				`http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/customer/${id}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);
			if (res.ok) {
				setCustomers((prev) => prev.filter((cust) => cust.id !== id));
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to delete customer');
			}
		} catch (e) {
			console.error('Delete error:', e);
			alert('Network error during delete');
		} finally {
			setIsLoading(false);
		}
	};

	// Validate entire form before submit
	const validateForm = () => {
		const errors = {};
		if (!newCustomer.name.trim()) errors.name = 'Name is required';

		if (!newCustomer.accountNumber.trim()) {
			errors.accountNumber = 'Account Number is required';
		} else if (
			newCustomer.accountNumber.includes('/') ||
			newCustomer.accountNumber.includes('+')
		) {
			errors.accountNumber =
				'Account Number cannot contain / or + characters';
		} else if (newCustomer.accountNumber.trim().length < 5) {
			errors.accountNumber = 'Account Number seems too short';
		} else if (newCustomer.accountNumber.trim().length > 30) {
			errors.accountNumber = 'Account Number cannot exceed 30 characters';
		}

		if (!newCustomer.address.trim()) errors.address = 'Address is required';

		if (!newCustomer.phoneNumber.trim()) {
			errors.phoneNumber = 'Phone Number is required';
		} else {
			if (!/^[1-9][0-9]*$/.test(newCustomer.phoneNumber)) {
				errors.phoneNumber =
					'Phone Number must be digits only and cannot start with 0';
			}
		}

		return errors;
	};

	// Validate a single field on input change (for real-time validation)
	const validateField = (name, value) => {
		let error = '';

		if (name === 'accountNumber') {
			if (value.trim() === '') {
				error = 'Account Number is required';
			} else if (value.includes('/') || value.includes('+')) {
				error = 'Account Number cannot contain / or + characters';
			} else if (value.trim().length < 5) {
				error = 'Account Number seems too short';
			} else if (value.trim().length > 30) {
				error = 'Account Number cannot exceed 30 characters';
			}
		} else if (name === 'phoneNumber') {
			if (value.trim() === '') {
				error = 'Phone Number is required';
			} else if (!/^[1-9][0-9]*$/.test(value)) {
				error =
					'Phone Number must be digits only and cannot start with 0';
			}
		} else {
			if (value.trim() === '') {
				const label =
					name === 'phoneNumber'
						? 'Phone Number'
						: name.charAt(0).toUpperCase() + name.slice(1);
				error = `${label} is required`;
			}
		}

		setFormErrors((prevErrors) => ({
			...prevErrors,
			[name]: error,
		}));
	};

	// On input change, update state and validate field realtime
	const handleInputChange = (e) => {
		const { id, value } = e.target;

		if (id === 'phoneNumber') {
			let digitsOnly = value.replace(/\D/g, '');

			if (digitsOnly.startsWith('0')) {
				digitsOnly = digitsOnly.slice(1);
			}

			setNewCustomer((prev) => ({
				...prev,
				phoneNumber: digitsOnly,
			}));

			validateField(id, digitsOnly);
		} else {
			setNewCustomer((prev) => ({
				...prev,
				[id]: value,
			}));
			validateField(id, value);
		}
	};

	// Format date-time as YYYY-MM-DD HH:mm
	const formatDateTime = (isoString) => {
		if (!isoString) return '';
		const date = new Date(isoString);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		const h = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
		return `${y}-${m}-${d} ${h}:${min}`;
	};

	// Edit button click handler: open modal with customer data
	const handleEditClick = (customer) => {
		setIsEditMode(true);
		setEditingCustomer(customer);
		setNewCustomer({
			name: customer.name,
			accountNumber: customer.accountNumber,
			address: customer.address,
			phoneNumber: customer.phoneNumber.startsWith('+94')
				? customer.phoneNumber.slice(3)
				: customer.phoneNumber,
		});
		setFormErrors({});
		setShowModal(true);
	};

	const handleAddOrEditCustomerSubmit = async (e) => {
		e.preventDefault();
		const errors = validateForm();
		setFormErrors(errors);
		if (Object.keys(errors).length > 0) return;

		setIsLoading(true);
		try {
			const customerToSend = {
				...newCustomer,
				phoneNumber: newCustomer.phoneNumber,
			};

			let res;
			if (isEditMode && editingCustomer) {
				// Include id when updating
				customerToSend.id = editingCustomer.id;

				res = await fetch(
					`http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/customer/`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(customerToSend),
						credentials: 'include',
					}
				);
			} else {
				// Add mode: POST request to create new customer
				res = await fetch(
					'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/customer/',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(customerToSend),
						credentials: 'include',
					}
				);
			}

			if (res.ok) {
				await fetchCustomers();
				setShowModal(false);
				setNewCustomer({
					name: '',
					accountNumber: '',
					address: '',
					phoneNumber: '',
				});
				setFormErrors({});
				setIsEditMode(false);
				setEditingCustomer(null);
			} else {
				const data = await res.json();
				if (
					data.error &&
					data.error.toLowerCase().includes('already taken')
				) {
					setFormErrors((prev) => ({
						...prev,
						accountNumber: data.error,
					}));
				} else {
					alert(data.error || 'Failed to save customer');
				}
			}
		} catch (e) {
			console.error('Save customer error:', e);
			alert('Network error during saving customer');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<div className='p-6 bg-white rounded-sm shadow-lg overflow-x-auto'>
				<div className='flex justify-between items-center mb-6'>
					<button
						type='button'
						onClick={() => {
							setIsEditMode(false);
							setEditingCustomer(null);
							setNewCustomer({
								name: '',
								accountNumber: '',
								address: '',
								phoneNumber: '',
							});
							setFormErrors({});
							setShowModal(true);
						}}
						className='text-[0.8rem] inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition'>
						<PlusIcon className='h-4 w-4 mr-2' />
						<span>Add New Customer</span>
					</button>

					<div className='flex items-center space-x-3'>
						<input
							type='text'
							placeholder='Search by Name, Account Number or Phone...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
						/>
						{/* Filter button removed */}
					</div>
				</div>

				<table className='min-w-full table-auto border-collapse shadow-md rounded-lg overflow-hidden'>
					<thead className='bg-gray-100'>
						<tr>
							{[
								'ID',
								'Name',
								'Account Number',
								'Address',
								'Phone Number',
								'Created At',
								'Updated At',
								'Actions',
							].map((header) => (
								<th
									key={header}
									className='text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300'>
									{header}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{filteredCustomers.length > 0 ? (
							filteredCustomers.map((cust, idx) => (
								<tr
									key={cust.id}
									className={
										idx % 2 === 0
											? 'bg-white'
											: 'bg-gray-50 hover:bg-gray-100'
									}>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{cust.id}
									</td>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{cust.name}
									</td>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{cust.accountNumber}
									</td>
									<td className='px-6 py-4 text-gray-800 max-w-xs truncate'>
										{cust.address}
									</td>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{cust.phoneNumber.startsWith('+94')
											? cust.phoneNumber
											: '+94' + cust.phoneNumber}
									</td>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{formatDateTime(cust.createdAt)}
									</td>
									<td className='px-6 py-4 text-gray-800 whitespace-nowrap'>
										{formatDateTime(cust.updatedAt)}
									</td>
									<td className='px-6 py-4 whitespace-nowrap space-x-2 flex items-center'>
										<button
											type='button'
											aria-label='Update'
											onClick={() =>
												handleEditClick(cust)
											}
											className='p-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition'>
											<PencilIcon className='h-4 w-4' />
										</button>
										<button
											type='button'
											aria-label='Delete'
											onClick={() =>
												handleDelete(cust.id)
											}
											className='p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition'>
											<TrashIcon className='h-4 w-4' />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan='8'
									className='text-center py-8 text-gray-500 italic'>
									No customers found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{showModal && (
				<div
					className='fixed inset-0 flex justify-center items-center z-50'
					style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
					<div className='bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4'>
						<h2 className='text-2xl font-semibold mb-6 text-gray-900'>
							{isEditMode ? 'Edit Customer' : 'Add New Customer'}
						</h2>
						<form
							onSubmit={handleAddOrEditCustomerSubmit}
							noValidate>
							{/* Name */}
							<div className='mb-5'>
								<label
									htmlFor='name'
									className='block mb-2 font-semibold text-gray-800 text-lg'>
									Name
								</label>
								<input
									type='text'
									id='name'
									value={newCustomer.name}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 rounded-lg border ${
										formErrors.name
											? 'border-red-500'
											: 'border-gray-300'
									} shadow-sm focus:outline-none focus:ring-3 ${
										formErrors.name
											? 'focus:ring-red-300'
											: 'focus:ring-blue-300'
									} transition`}
									placeholder='Enter customer name'
								/>
								{formErrors.name && (
									<p className='text-red-600 text-sm mt-1'>
										{formErrors.name}
									</p>
								)}
							</div>

							{/* Account Number */}
							<div className='mb-5'>
								<label
									htmlFor='accountNumber'
									className='block mb-2 font-semibold text-gray-800 text-lg'>
									Account Number (Eg: NIC no)
								</label>
								<input
									type='text'
									id='accountNumber'
									value={newCustomer.accountNumber}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 rounded-lg border ${
										formErrors.accountNumber
											? 'border-red-500'
											: 'border-gray-300'
									} shadow-sm focus:outline-none focus:ring-3 ${
										formErrors.accountNumber
											? 'focus:ring-red-300'
											: 'focus:ring-blue-300'
									} transition`}
									placeholder='Enter account number'
								/>
								{formErrors.accountNumber && (
									<p className='text-red-600 text-sm mt-1'>
										{formErrors.accountNumber}
									</p>
								)}
							</div>

							{/* Address */}
							<div className='mb-5'>
								<label
									htmlFor='address'
									className='block mb-2 font-semibold text-gray-800 text-lg'>
									Address
								</label>
								<input
									type='text'
									id='address'
									value={newCustomer.address}
									onChange={handleInputChange}
									className={`w-full px-4 py-3 rounded-lg border ${
										formErrors.address
											? 'border-red-500'
											: 'border-gray-300'
									} shadow-sm focus:outline-none focus:ring-3 ${
										formErrors.address
											? 'focus:ring-red-300'
											: 'focus:ring-blue-300'
									} transition`}
									placeholder='Enter address'
								/>
								{formErrors.address && (
									<p className='text-red-600 text-sm mt-1'>
										{formErrors.address}
									</p>
								)}
							</div>

							{/* Phone Number with +94 prefix (non-editable) */}
							<div className='mb-8'>
								<label
									htmlFor='phoneNumber'
									className='block mb-2 font-semibold text-gray-800 text-lg'>
									Phone Number
								</label>
								<div className='flex items-center'>
									<span className='inline-block px-3 py-3 rounded-l-lg bg-gray-200 text-gray-800 font-semibold select-none'>
										+94
									</span>
									<input
										type='tel'
										id='phoneNumber'
										value={newCustomer.phoneNumber}
										onChange={handleInputChange}
										className={`w-full px-4 py-3 rounded-r-lg border-l-0 ${
											formErrors.phoneNumber
												? 'border-red-500'
												: 'border-gray-300'
										} shadow-sm focus:outline-none focus:ring-3 ${
											formErrors.phoneNumber
												? 'focus:ring-red-300'
												: 'focus:ring-blue-300'
										} transition`}
										placeholder='Enter phone number'
										maxLength={9}
									/>
								</div>
								{formErrors.phoneNumber && (
									<p className='text-red-600 text-sm mt-1'>
										{formErrors.phoneNumber}
									</p>
								)}
							</div>

							{/* Buttons */}
							<div className='flex justify-between'>
								<button
									type='submit'
									className='px-5 py-3 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition'>
									{isEditMode
										? 'Update Customer'
										: 'Add Customer'}
								</button>

								<button
									type='button'
									onClick={() => {
										setShowModal(false);
										setFormErrors({});
										setIsEditMode(false);
										setEditingCustomer(null);
									}}
									className='px-5 py-3 bg-gray-400 text-white font-semibold rounded-md shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition'>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isLoading && <Loader />}
		</>
	);
};

export default CustomerManagementPage;

import React, { useState, useEffect } from 'react';
import {
	PencilIcon,
	TrashIcon,
	PlusIcon,
	XCircleIcon,
} from '@heroicons/react/24/solid';
import Loader from '../components/loader/Loader';

const CategoryManagementPage = () => {
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [categoryName, setCategoryName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			setIsLoading(true);
			const res = await fetch(
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/category',
				{ credentials: 'include' }
			);
			if (res.ok) {
				const data = await res.json();
				setCategories(data);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const openModalForCreate = () => {
		setSelectedCategory(null);
		setCategoryName('');
		setErrorMessage('');
		setIsModalOpen(true);
	};

	const openModalForEdit = (category) => {
		setSelectedCategory(category);
		setCategoryName(category.categoryName);
		setErrorMessage('');
		setIsModalOpen(true);
	};

	const handleSaveCategory = async () => {
		if (!categoryName.trim()) {
			setErrorMessage('Category name is required');
			return;
		}

		try {
			setIsLoading(true);
			const url =
				'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/category';
			const method = selectedCategory ? 'PUT' : 'POST';

			const bodyData = selectedCategory
				? { id: selectedCategory.id, categoryName }
				: { categoryName };

			const res = await fetch(url, {
				method,
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyData),
			});

			if (res.ok) {
				fetchCategories();
				setIsModalOpen(false);
			} else {
				console.error('Failed to save category:', await res.text());
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteCategory = async (id) => {
		if (!window.confirm('Are you sure you want to delete this category?'))
			return;

		try {
			setIsLoading(true);
			const res = await fetch(
				`http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/category/${id}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);
			if (res.ok) {
				fetchCategories();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='h-screen flex flex-col p-6 space-y-6 bg-gray-50'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<button
					onClick={openModalForCreate}
					className='text-[0.9rem] flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
					<PlusIcon className='h-5 w-5' />
					<span>Add Category</span>
				</button>
			</div>

			{/* Categories table */}
			<div className='flex-1 bg-white shadow-lg rounded-xl overflow-hidden'>
				<div className='overflow-x-auto max-h-full'>
					<table className='min-w-full table-auto border-collapse'>
						<thead className='bg-gray-100 sticky top-0'>
							<tr>
								<th className='px-6 py-3 text-left font-medium text-gray-700'>
									ID
								</th>
								<th className='px-6 py-3 text-left font-medium text-gray-700'>
									Name
								</th>
								<th className='px-6 py-3 text-center font-medium text-gray-700'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{categories.length > 0 ? (
								categories.map((cat) => (
									<tr
										key={cat.id}
										className='border-t border-gray-200 hover:bg-gray-50 transition'>
										<td className='px-6 py-3'>{cat.id}</td>
										<td className='px-6 py-3'>
											{cat.categoryName}
										</td>
										<td className='px-6 py-3 flex justify-center space-x-2'>
											<button
												onClick={() =>
													openModalForEdit(cat)
												}>
												<PencilIcon className='h-5 w-5 text-green-500 hover:text-green-700 transition' />
											</button>
											<button
												onClick={() =>
													handleDeleteCategory(cat.id)
												}>
												<TrashIcon className='h-5 w-5 text-red-500 hover:text-red-700 transition' />
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan='3'
										className='text-center py-6 text-gray-400'>
										No categories available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className='fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
					<div className='bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-lg p-6 transform transition-all scale-105'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-xl font-bold text-gray-800'>
								{selectedCategory
									? 'Edit Category'
									: 'Add Category'}
							</h2>
							<button
								onClick={() => setIsModalOpen(false)}
								className='text-gray-500 hover:text-gray-800 transition'>
								<XCircleIcon className='h-6 w-6' />
							</button>
						</div>
						<div className='space-y-4'>
							<input
								type='text'
								placeholder='Category Name'
								value={categoryName}
								onChange={(e) => {
									setCategoryName(e.target.value);
									setErrorMessage('');
								}}
								className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition ${
									errorMessage
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300 focus:ring-blue-500'
								}`}
							/>
							{errorMessage && (
								<p className='text-red-500 text-sm'>
									{errorMessage}
								</p>
							)}
							<button
								onClick={handleSaveCategory}
								className='w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
								{selectedCategory
									? 'Update Category'
									: 'Add Category'}
							</button>
						</div>
					</div>
				</div>
			)}

			{isLoading && <Loader />}
		</div>
	);
};

export default CategoryManagementPage;

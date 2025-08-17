import React, { useEffect, useState } from "react";
import Loader from "../components/loader/Loader";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

const ItemManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal & form states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    itemName: "",
    description: "",
    brand: "",
    category: null, // expect object { id, name }
    price: "",
    stock: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/item/",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setItems(data);
      setIsError(false);
    } catch (e) {
      console.error("Error fetching items:", e);
      setIsError(true);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/category/",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const filteredItems = items
    .slice()
    .sort((a, b) => a.id - b.id) // order by id ascending
    .filter((item) =>
      [
        item.itemName,
        item.description,
        item.brand,
        item.category?.categoryName || "",
        item.price?.toString(),
        item.stock?.toString(),
      ]
        .some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

  if (isError) {
    return (
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Something went wrong...
      </h2>
    );
  }

  // Date format helper
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}`;
  };

  const validateForm = () => {
    const errors = {};
    if (!newItem.itemName.trim()) errors.itemName = "Item Name is required";
    if (!newItem.brand.trim()) errors.brand = "Brand is required";
    if (newItem.description && newItem.description.length > 40) {
      errors.description = "Description should be less than 40 characters";
    }
    if (!newItem.category) errors.category = "Category is required";
    
    // Price validation
    if (!newItem.price) {
      errors.price = "Price is required";
    } else if (isNaN(newItem.price) || Number(newItem.price) < 0) {
      errors.price = "Price must be a positive number";
    }
    
    // Stock validation
    if (!newItem.stock) {
      errors.stock = "Stock is required";
    } else if (!Number.isInteger(Number(newItem.stock)) || Number(newItem.stock) < 0) {
      errors.stock = "Stock must be a positive integer";
    }
    return errors;
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "itemName" && !value.trim()) {
      error = "Item Name is required";
    } else if (name === "brand" && !value.trim()) {
      error = "Brand is required";
    } else if (name === "description" && value.length > 40) {
      error = "Description should be less than 40 characters";
    } else if (name === "category" && !value) {
      error = "Category is required";
    } else if (name === "price") {
      if (!value) {
        error = "Price is required";
      } else if (isNaN(value) || Number(value) < 0) {
        error = "Price must be a positive number";
      }
    } else if (name === "stock") {
      if (!value) {
        error = "Stock is required";
      } else if (!Number.isInteger(Number(value)) || Number(value) < 0) {
        error = "Stock must be a positive integer";
      }
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Prevent non-numeric input for price and stock
    if (id === "price" || id === "stock") {
      // Allow only numbers, decimal point (for price), and backspace
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setNewItem((prev) => ({ ...prev, [id]: value }));
        validateField(id, value);
      }
      return;
    }

    if (id === "category") {
      const selectedCat = categories.find((cat) => cat.id.toString() === value);
      setNewItem((prev) => ({ ...prev, category: selectedCat }));
      validateField(id, selectedCat);
    } else {
      setNewItem((prev) => ({ ...prev, [id]: value }));
      validateField(id, value);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/item/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete item");
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("Network error during delete");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setEditingItem(item);
    setNewItem({
      itemName: item.itemName || "",
      description: item.description || "",
      brand: item.brand || "",
      category: item.category || null,
      price: item.price ? (item.price / 100).toFixed(2) : "",
      stock: item.stock?.toString() || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleAddOrEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const itemToSend = {
        ...newItem,
        price: Math.round(parseFloat(newItem.price) * 100),
        stock: Number(newItem.stock),
        category: newItem.category, // send full category object or just id depending on backend
      };

      let res;
      if (isEditMode && editingItem) {
        itemToSend.id = editingItem.id;
        res = await fetch(
          "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/item/",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemToSend),
            credentials: "include",
          }
        );
      } else {
        res = await fetch(
          "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/item/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemToSend),
            credentials: "include",
          }
        );
      }

      if (res.ok) {
        await fetchItems();
        setShowModal(false);
        setNewItem({
          itemName: "",
          description: "",
          brand: "",
          category: null,
          price: "",
          stock: "",
        });
        setFormErrors({});
        setIsEditMode(false);
        setEditingItem(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save item");
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Network error during saving item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 bg-white rounded-sm shadow-lg w-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setIsEditMode(false);
              setEditingItem(null);
              setNewItem({
                itemName: "",
                description: "",
                brand: "",
                category: null,
                price: "",
                stock: "",
              });
              setFormErrors({});
              setShowModal(true);
            }}
            className="text-[0.8rem] inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>Add New Item</span>
          </button>

          <input
            type="text"
            placeholder="Search by name, brand, description, category, price, stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-96 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="overflow-x-auto w-full max-w-full">
          <div className="max-h-[700px] overflow-y-auto">
            <table className="min-w-max table-auto border-collapse shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "ID",
                    "Item Name",
                    "Description",
                    "Brand",
                    "Category",
                    "Price",
                    "Stock",
                    "Created At",
                    "Updated At",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                      }
                    >
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap max-w-xs truncate">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 text-gray-800 max-w-sm truncate">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {item.brand || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {item.category?.categoryName || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {(item.price / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {item.stock}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {formatDateTime(item.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2 flex items-center">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500 italic">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {isEditMode ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleAddOrEditSubmit} noValidate>
              {/* Item Name */}
              <div className="mb-5">
                <label
                  htmlFor="itemName"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={newItem.itemName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.itemName ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.itemName
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                  placeholder="Enter item name"
                />
                {formErrors.itemName && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.itemName}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-5">
                <label
                  htmlFor="description"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.description ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.description
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                  placeholder="Enter description"
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="mb-5">
                <label
                  htmlFor="brand"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  value={newItem.brand}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.brand ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.brand
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                  placeholder="Enter brand"
                />
                {formErrors.brand && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.brand}</p>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <label
                  htmlFor="category"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={newItem.category?.id || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.category ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.category
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-5">
                <label
                  htmlFor="price"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.price ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.price
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                  placeholder="Enter price"
                />
                {formErrors.price && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div className="mb-8">
                <label
                  htmlFor="stock"
                  className="block mb-2 font-semibold text-gray-800 text-lg"
                >
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  step="1"
                  value={newItem.stock}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.stock ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-3 ${formErrors.stock
                      ? "focus:ring-red-300"
                      : "focus:ring-blue-300"
                    } transition`}
                  placeholder="Enter stock quantity"
                />
                {formErrors.stock && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.stock}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {isEditMode ? "Update Item" : "Add Item"}
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

export default ItemManagementPage;
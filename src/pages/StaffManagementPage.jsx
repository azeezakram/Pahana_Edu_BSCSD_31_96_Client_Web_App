import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import Loader from "../components/loader/Loader";

const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff",
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one digit";
    return "";
  };

  const openModalForCreate = () => {
    setSelectedStaff(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      isActive: true,
    });
    setUsernameError("");
    setPasswordError("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      username: staffMember.username,
      password: "",
      isActive: staffMember.isActive,
    });
    setUsernameError("");
    setPasswordError("");
    setIsModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!formData.name.trim() || !formData.username.trim()) return;

    // validate password if creating OR updating with a new password
    if (!selectedStaff || (selectedStaff && formData.password.trim())) {
      const pwdError = validatePassword(formData.password);
      if (pwdError) {
        setPasswordError(pwdError);
        return;
      }
    }

    try {
      setIsLoading(true);
      setUsernameError("");

      const url = selectedStaff
        ? "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff"
        : "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff";
      const method = selectedStaff ? "PUT" : "POST";

      const payload = {
        ...(selectedStaff ? { id: selectedStaff.id } : {}),
        name: formData.name,
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchStaff();
        setIsModalOpen(false);
      } else if (res.status === 409) {
        const data = await res.json();
        setUsernameError(data.error || "Username already exists");
      } else {
        console.error("Failed to save staff");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;

    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={openModalForCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-[0.8rem]"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-full">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">
                  Username
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-3">{member.id}</td>
                    <td className="px-6 py-3">{member.name}</td>
                    <td className="px-6 py-3">{member.username}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex justify-center space-x-2">
                      <button onClick={() => openModalForEdit(member)}>
                        <PencilIcon className="h-5 w-5 text-green-500 hover:text-green-700 transition" />
                      </button>
                      <button onClick={() => handleDeleteStaff(member.id)}>
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700 transition" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-lg p-6 transform transition-all scale-105">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedStaff ? "Edit Staff" : "Add Staff"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition ${
                  usernameError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {usernameError && (
                <p className="text-red-500 text-sm">{usernameError}</p>
              )}
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setPasswordError("");
                }}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition ${
                  passwordError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span>Active</span>
              </div>
              <button
                onClick={handleSaveStaff}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {selectedStaff ? "Update Staff" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <Loader />}
    </div>
  );
};

export default StaffManagementPage;

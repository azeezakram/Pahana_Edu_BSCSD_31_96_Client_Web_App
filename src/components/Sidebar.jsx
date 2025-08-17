import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CreditCardIcon,
  UserGroupIcon,
  UsersIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Billing Section", path: "/billing", icon: <CreditCardIcon className="h-5 w-5" /> },
  { name: "Customer Management", path: "/customers", icon: <UserGroupIcon className="h-5 w-5" /> },
  { name: "Staff Management", path: "/staff", icon: <UsersIcon className="h-5 w-5" /> },
  { name: "Item Management", path: "/items", icon: <CubeIcon className="h-5 w-5" /> },
  { name: "Sales History", path: "/sales-history", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  { name: "Category Management", path: "/categories", icon: <TagIcon className="h-5 w-5" /> },
  { name: "Help", path: "/help", icon: <QuestionMarkCircleIcon className="h-5 w-5" /> },
];



export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout API
      const res = await fetch(
        "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.warn("Logout request failed with status:", res.status);
      }

      // Clear any client-side authentication storage if used
      // localStorage.removeItem("authToken");

    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Redirect to login page
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      className={`h-screen bg-gray-900 text-white shadow-lg flex flex-col transition-[width] duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Top Section */}
      <div
        className={`flex items-center p-4 border-b border-gray-700 relative ${
          isOpen ? "justify-between" : "justify-center"
        }`}
      >
        {/* Logo */}
        <span
          className={`text-2xl font-bold whitespace-nowrap transition-opacity duration-200 ${
            isOpen ? "opacity-100 delay-200" : "opacity-0 delay-0"
          }`}
        >
          <span className="text-amber-400">P</span>ahana <span className="font-light"><span className="">E</span>du</span> <span className="text-[1rem] font-light text-gray-400">Staff</span>
        </span>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white flex items-center justify-center absolute cursor-pointer"
          style={{
            top: "50%",
            right: isOpen ? "1rem" : "auto",
            left: isOpen ? "auto" : "50%",
            transform: isOpen ? "translateY(-50%)" : "translate(-50%, -50%)",
          }}
          aria-label="Toggle Sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <div className="flex-shrink-0 flex items-center justify-center w-6">
              {item.icon}
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isOpen ? "opacity-100 max-w-full ml-1" : "opacity-0 max-w-0 ml-4"
              }`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout at Bottom */}
      <NavLink
        to="/logout"
        className="flex items-center px-4 py-2 rounded-lg m-3 mt-auto mb-6 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
      onClick={handleLogout}>
        <div className="flex-shrink-0 flex items-center justify-center w-6">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </div>
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isOpen ? "opacity-100 max-w-full ml-1" : "opacity-0 max-w-0 ml-4"
          }`}
        >
          Logout
        </span>
      </NavLink>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  TagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const DashboardPage = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Item Management",
      description: "View, add, edit, or delete items in inventory.",
      icon: <CubeIcon className="w-10 h-10 text-blue-600" />,
      path: "/items",
      color: "from-blue-50 to-blue-100",
    },
    {
      title: "Staff Management",
      description: "Manage staff accounts and permissions.",
      icon: <UserGroupIcon className="w-10 h-10 text-green-600" />,
      path: "/staff",
      color: "from-green-50 to-green-100",
    },
    {
      title: "Customer Management",
      description: "Manage customer profiles and interactions.",
      icon: <UsersIcon className="w-10 h-10 text-teal-600" />,
      path: "/customers",
      color: "from-teal-50 to-teal-100",
    },
    {
      title: "Category Management",
      description: "Organize items into categories.",
      icon: <TagIcon className="w-10 h-10 text-pink-600" />,
      path: "/categories",
      color: "from-pink-50 to-pink-100",
    },
    {
      title: "Billing",
      description: "Manage invoices, payments, and receipts.",
      icon: <CreditCardIcon className="w-10 h-10 text-red-600" />,
      path: "/billing",
      color: "from-red-50 to-red-100",
    },
    {
      title: "Reports",
      description: "View sales and inventory performance reports.",
      icon: <ChartBarIcon className="w-10 h-10 text-purple-600" />,
      path: "/reports",
      color: "from-purple-50 to-purple-100",
    },
    {
      title: "Help & Training",
      description: "Watch tutorials and read usage guides.",
      icon: <QuestionMarkCircleIcon className="w-10 h-10 text-orange-600" />,
      path: "/help",
      color: "from-orange-50 to-orange-100",
    },
  ];

  return (
    <div className="p-8 w-full h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`cursor-pointer p-6 rounded-2xl shadow-md bg-gradient-to-br ${item.color} hover:shadow-xl transition`}
          >
            <div className="flex items-center space-x-4">
              {item.icon}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

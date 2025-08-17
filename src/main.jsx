import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "./App";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import StaffAuthPage from "./pages/StaffAuthPage";
import ItemManagementPage from "./pages/ItemManagementPage";
import BillingSectionPage from "./pages/BillingSectionPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import HelpPage from "./pages/HelpPage";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  // Public routes (login/register)
  {
    path: "/login",
    element: <StaffAuthPage />,
  },
  {
    path: "/register",
    element: <StaffAuthPage />,
  },

  // Protected routes under App layout
  {
    path: "/",
    element: <App />,
    errorElement: <h2>404 Page not found</h2>,
    children: [
      { index: true, element: <DashboardPage/> },
      { path: "billing", element: <BillingSectionPage/> },
      { path: "customers", element: <CustomerManagementPage /> },
      { path: "staff", element: <StaffManagementPage/> },
      { path: "items", element: <ItemManagementPage/> },
      { path: "sales-history", element: <SalesHistoryPage/> },
      { path: "categories", element: <CategoryManagementPage/> },
      { path: "help", element: <HelpPage/> },
      { path: "logout", element: <h1>Logout</h1> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

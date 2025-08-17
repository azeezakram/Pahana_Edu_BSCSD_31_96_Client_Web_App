import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import Loader from "./components/loader/Loader";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Billing Section", path: "/billing" },
  { name: "Customer Management", path: "/customers" },
  { name: "Staff Management", path: "/staff" },
  { name: "Item Management", path: "/items" },
  { name: "Sales History", path: "/sales-history" },
  { name: "Category Management", path: "/categories" },
  { name: "Help", path: "/help" },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState("Admin User");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(
          "http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff/current",
          {
            credentials: "include",
            method: "POST",
          }
        );
        if (res.status === 200) {
          const data = await res.json();
          setIsLoggedIn(true);

          // Assuming your API returns the staff info with a "name" field:
          if (data.name) {
            setStaffName(data.name);
          }
        } else {
          setIsLoggedIn(false);
          if (!isAuthPage(location.pathname)) {
            navigate("/login", { replace: true });
          }
        }
      } catch {
        setIsLoggedIn(false);
        if (!isAuthPage(location.pathname)) {
          navigate("/login", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [location.pathname, navigate]);

  function isAuthPage(path) {
    return path.startsWith("/login") || path.startsWith("/register");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Loader />;
  }

  const activeNavItem =
    navItems.find(
      (item) =>
        item.path === location.pathname ||
        (item.path !== "/" && location.pathname.startsWith(item.path))
    )?.name || "Dashboard";

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        {/* Pass staffName to TopNavbar */}
        <TopNavbar title={activeNavItem} profileName={staffName} />

        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

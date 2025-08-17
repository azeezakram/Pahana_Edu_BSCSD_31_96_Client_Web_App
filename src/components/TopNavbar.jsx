// src/components/TopNavbar.jsx
import React from "react";

export default function TopNavbar({ title, profileName, profileImage }) {
  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-4">
      <h1 className="text-[1.1rem] font-medium  text-gray-800">{title}</h1>

      <div className="flex items-center space-x-3">
        <span className="text-gray-700 font-medium">{profileName}</span>
        <img
          src={profileImage || "https://i.pravatar.cc/40"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
}

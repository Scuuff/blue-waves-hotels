import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#2F4156]">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 min-h-screen md:ml-64">
          <Topbar />

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
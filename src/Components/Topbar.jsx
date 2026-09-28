import React from "react";

function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#C8D9E6] bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-[#2F4156]">Admin Management</h2>
          <p className="text-sm text-[#567C8D]">
            Manage NovaNest branches professionally
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-[#C8D9E6] px-4 py-2 text-sm font-medium text-[#2F4156] sm:block">
            Admin
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#567C8D] text-white font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
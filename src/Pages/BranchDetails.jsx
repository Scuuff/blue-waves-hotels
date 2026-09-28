import React from "react";
import { Link, useParams } from "react-router-dom";
import branchesData from "../data/hotels";

function BranchDetails() {
  const { id } = useParams();

  const selectedBranch = branchesData.find(
    (branch) => branch.id === Number(id)
  );

  if (!selectedBranch) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2F4156]">Branch Not Found</h1>
        <p className="mt-2 text-[#567C8D]">
          The branch you are trying to view does not exist.
        </p>

        <Link
          to="/admin/hotels"
          className="mt-6 inline-flex rounded-xl bg-[#2F4156] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#567C8D]"
        >
          Back to Hotel Management
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2F4156] sm:text-3xl">
              Branch Details
            </h1>
            <p className="mt-2 text-sm text-[#567C8D] sm:text-base">
              View complete information about this NovaNest branch.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/hotels/edit/${selectedBranch.id}`}
              className="rounded-xl bg-[#567C8D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F4156]"
            >
              Edit Branch
            </Link>

            <Link
              to="/admin/hotels"
              className="rounded-xl border border-[#567C8D] px-5 py-3 text-sm font-semibold text-[#567C8D] transition hover:bg-[#567C8D] hover:text-white"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <img
          src={selectedBranch.image}
          alt={selectedBranch.name}
          className="h-80 w-full object-cover"
        />

        <div className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2F4156]">
                {selectedBranch.name}
              </h2>
              <p className="mt-1 text-base text-[#567C8D]">
                {selectedBranch.city}, Egypt
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedBranch.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedBranch.status}
              </span>

              <span className="rounded-full bg-[#F5EFEB] px-4 py-2 text-sm font-semibold text-[#2F4156]">
                {"★".repeat(selectedBranch.rating)}
              </span>
            </div>
          </div>

          <p className="text-sm leading-7 text-[#567C8D] sm:text-base">
            {selectedBranch.description}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#567C8D]">City</p>
          <h3 className="mt-2 text-xl font-bold text-[#2F4156]">
            {selectedBranch.city}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#567C8D]">Branch Status</p>
          <h3 className="mt-2 text-xl font-bold text-[#2F4156]">
            {selectedBranch.status}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#567C8D]">Star Rating</p>
          <h3 className="mt-2 text-xl font-bold text-[#2F4156]">
            {selectedBranch.rating} Stars
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#567C8D]">Amenities</p>
          <h3 className="mt-2 text-xl font-bold text-[#2F4156]">
            {selectedBranch.amenities.length}
          </h3>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Contact Info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-1">
          <h3 className="text-xl font-bold text-[#2F4156]">
            Contact Information
          </h3>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-[#567C8D]">Address</p>
              <p className="mt-1 text-sm leading-6 text-[#2F4156]">
                {selectedBranch.address}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#567C8D]">Phone</p>
              <p className="mt-1 text-sm text-[#2F4156]">
                {selectedBranch.phone}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#567C8D]">Email</p>
              <p className="mt-1 text-sm text-[#2F4156]">
                {selectedBranch.email}
              </p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-xl font-bold text-[#2F4156]">
            Branch Amenities
          </h3>

          <p className="mt-2 text-sm text-[#567C8D]">
            Services and facilities available in this branch.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {selectedBranch.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-[#F5EFEB] px-4 py-2 text-sm font-medium text-[#2F4156]"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BranchDetails;
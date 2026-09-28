import React from "react";
import { Link, useParams } from "react-router-dom";
import BranchForm from "../Components/BranchForm.jsx";
import branchesData from "../data/hotels.js";

function EditBranch() {
  const { id } = useParams();

  const selectedBranch = branchesData.find(
    (branch) => branch.id === Number(id)
  );

  const handleEditBranch = (formData) => {
    console.log("Updated Branch Data:", formData);
  };

  if (!selectedBranch) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2F4156]">Branch Not Found</h1>
        <p className="mt-2 text-[#567C8D]">
          The branch you are trying to edit does not exist.
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
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2F4156] sm:text-3xl">
          Edit Branch
        </h1>
        <p className="mt-2 text-sm text-[#567C8D] sm:text-base">
          Update the information of {selectedBranch.name}.
        </p>
      </div>

      <BranchForm
        mode="edit"
        initialData={selectedBranch}
        onSubmit={handleEditBranch}
        submitButtonText="Update Branch"
        successMessage="Branch information updated successfully."
      />
    </section>
  );
}

export default EditBranch;
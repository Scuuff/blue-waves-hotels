import React from "react";
import BranchForm from "../Components/BranchForm.jsx";

function AddBranch() {
  const handleAddBranch = (formData) => {
    console.log("New Branch Data:", formData);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2F4156] sm:text-3xl">
          Add New Branch
        </h1>
        <p className="mt-2 text-sm text-[#567C8D] sm:text-base">
          Create a new NovaNest branch with its main property information.
        </p>
      </div>

      <BranchForm
        onSubmit={handleAddBranch}
        submitButtonText="Save Branch"
        successMessage="Branch information saved successfully."
      />
    </section>
  );
}

export default AddBranch;
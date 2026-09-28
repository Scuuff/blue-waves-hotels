import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import usePromoCode from "../hooks/usePromoCode";

const promoSchema = Yup.object({
  code: Yup.string()
    .min(4, "Promo code must be at least 4 characters")
    .max(20, "Promo code is too long")
    .required("Please enter a promo code"),
});

const PromoSection = ({ onPromoApplied }) => {
  const { appliedPromo, promoError, promoSuccess, applyPromoCode, removePromo } = usePromoCode();

  const handleApply = (values, { setSubmitting, resetForm }) => {
    applyPromoCode(values.code);
    setSubmitting(false);
    if (onPromoApplied) {
      const upper = values.code.trim().toUpperCase();
      onPromoApplied(upper);
    }
    resetForm();
  };

  const handleRemove = () => {
    removePromo();
    if (onPromoApplied) onPromoApplied(null);
  };

  return (
    <div
      className="rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden"
      style={{ background: "#4f92ca" }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔑</span>
            <h2 className="font-serif text-2xl font-semibold" style={{ color: "#FFFFFF" }}>Have a Promo Code?</h2>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
            Enter your exclusive code below to unlock special discounts on all deals.
          </p>
          {appliedPromo && (
            <div
              className="mt-3 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl w-fit"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}
            >
              <span>✅</span>
              <span>Code <span className="font-bold">{appliedPromo.code}</span> — {appliedPromo.label}</span>
              <button onClick={handleRemove} className="ml-2 text-xs underline" style={{ color: "rgba(255,255,255,0.7)" }}>
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 max-w-sm">
          <Formik initialValues={{ code: "" }} validationSchema={promoSchema} onSubmit={handleApply}>
            {({ isSubmitting }) => (
              <Form>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col">
                    <Field
                      name="code"
                      type="text"
                      placeholder="e.g. SAVE10"
                      className="px-4 py-3 rounded-xl text-sm font-mono tracking-wider outline-none"
                      style={{
                        background: "#FFFFFF",
                        border: "none",
                        color: "#1a1a2e",
                      }}
                    />
                    <ErrorMessage name="code" component="p" className="text-xs mt-1 ml-1" style={{ color: "#fca5a5" }} />
                    {promoError && <p className="text-xs mt-1 ml-1" style={{ color: "#fca5a5" }}>{promoError}</p>}
                    {promoSuccess && <p className="text-xs mt-1 ml-1" style={{ color: "#FFFFFF" }}>{promoSuccess}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: "#FFFFFF", color: "#567C8D" }}
                  >
                    {isSubmitting ? "..." : "Apply"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          <p className="text-xs mt-2 ml-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Try: SAVE10, HOTEL20, SUMMER15, VIP30
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;

// components/admin/settings/PaymentsTab.jsx
import { useState } from "react";
import { Wallet, Percent } from "lucide-react";
import SettingCard from "../shared/SettingCard";
import { useLanguage } from "../../../Context/LanguageContext";
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function PaymentsTab() {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const [methods, setMethods] = useState({
    stripe: true,
    paypal: false,
    cash: true
  });

  const [fees, setFees] = useState({
    tax: 14,
    service: 5,
    deposit: 20
  });

  const toggleMethod = (key) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <SettingCard title={t("payments.methods")} icon={Wallet}>
        <div className="space-y-4">
          {[
            { key: "stripe", name: t("payments.stripe"), desc: t("payments.stripeDesc"), icon: "💳" },
            { key: "paypal", name: t("payments.paypal"), desc: t("payments.paypalDesc"), icon: "🅿️" },
            { key: "cash", name: t("payments.cash"), desc: t("payments.cashDesc"), icon: "💵" }
          ].map((method) => (
            <div
              key={method.key}
              className={`flex items-center justify-between p-4 border rounded-lg ${darkMode ? "border-gray-600" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{method.name}</p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{method.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleMethod(method.key)}
                data-state={methods[method.key] ? "on" : "off"}
                className="admin-switch"
              >
                <span className="admin-switch-thumb" />
              </button>
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard title={t("payments.pricingFees")} icon={Percent}>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
              {t("payments.taxRate")}
            </label>
            <input
              type="number"
              value={fees.tax}
              onChange={(e) => setFees((prev) => ({ ...prev, tax: parseInt(e.target.value) }))}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
              {t("payments.serviceFee")}
            </label>
            <input
              type="number"
              value={fees.service}
              onChange={(e) => setFees((prev) => ({ ...prev, service: parseInt(e.target.value) }))}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
              {t("payments.deposit")}
            </label>
            <input
              type="number"
              value={fees.deposit}
              onChange={(e) => setFees((prev) => ({ ...prev, deposit: parseInt(e.target.value) }))}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`}
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
}
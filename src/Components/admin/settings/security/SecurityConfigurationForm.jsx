import { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SettingCard from "../../shared/SettingCard";
import { useLanguage } from "../../../../Context/LanguageContext";
import useAdminThemeMode from "../../../../hooks/useAdminThemeMode";

const ipRegex =
  /^(?:(?:\s*(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\s*)(?:,\s*)?)*$/;

const validationSchema = Yup.object({
  minPasswordLength: Yup.number()
    .min(8, "Minimum password length must be at least 8")
    .max(64, "Minimum password length cannot exceed 64")
    .required("Required"),
  passwordExpiryDays: Yup.number()
    .min(1, "Password expiry must be at least 1 day")
    .max(365, "Password expiry cannot exceed 365 days")
    .required("Required"),
  sessionTimeoutMinutes: Yup.number()
    .min(5, "Session timeout must be at least 5 minutes")
    .max(240, "Session timeout cannot exceed 240 minutes")
    .required("Required"),
  auditRetentionDays: Yup.number()
    .min(7, "Audit retention must be at least 7 days")
    .max(365, "Audit retention cannot exceed 365 days")
    .required("Required"),
  ipWhitelist: Yup.string()
    .matches(ipRegex, "Please enter valid IP addresses separated by commas")
    .required("Required"),
});

const errorClass = "mt-1 text-xs font-medium text-rose-600";

function ConfigToggle({ name, label, description, darkMode }) {
  return (
    <label className={`flex items-start justify-between gap-4 rounded-lg border p-3 ${darkMode ? "border-gray-600 bg-gray-700" : "border-slate-200"}`}>
      <div>
        <p className={`font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{label}</p>
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{description}</p>
      </div>
      <Field type="checkbox" name={name} className="mt-1 h-4 w-4 accent-teal-500" />
    </label>
  );
}

export default function SecurityConfigurationForm({ settings, onSubmit }) {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-slate-300"}`;
  const labelClass = `mb-1 block text-sm font-medium ${darkMode ? "text-gray-300" : "text-slate-700"}`;
  const initialValues = useMemo(
    () => ({
      minPasswordLength: settings.minPasswordLength,
      requireSpecialCharacter: settings.requireSpecialCharacter,
      passwordExpiryDays: settings.passwordExpiryDays,
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      enforceTwoFactor: settings.enforceTwoFactor,
      ipWhitelist: settings.ipWhitelist,
      auditRetentionDays: settings.auditRetentionDays,
      piiMasking: settings.piiMasking,
      financialShield: settings.financialShield,
      dlpEnforcement: settings.dlpEnforcement,
      panicMode: settings.panicMode,
    }),
    [settings]
  );

  return (
    <SettingCard title={t("secConfig.title")}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, helpers) => {
          onSubmit(values);
          helpers.setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  {t("secConfig.minPasswordLength")}
                </label>
                <Field type="number" name="minPasswordLength" className={inputClass} />
                <ErrorMessage name="minPasswordLength" component="p" className={errorClass} />
              </div>

              <div>
                <label className={labelClass}>
                  {t("secConfig.passwordExpiry")}
                </label>
                <Field type="number" name="passwordExpiryDays" className={inputClass} />
                <ErrorMessage name="passwordExpiryDays" component="p" className={errorClass} />
              </div>

              <div>
                <label className={labelClass}>
                  {t("secConfig.sessionTimeout")}
                </label>
                <Field type="number" name="sessionTimeoutMinutes" className={inputClass} />
                <ErrorMessage name="sessionTimeoutMinutes" component="p" className={errorClass} />
              </div>

              <div>
                <label className={labelClass}>
                  {t("secConfig.auditRetention")}
                </label>
                <Field type="number" name="auditRetentionDays" className={inputClass} />
                <ErrorMessage name="auditRetentionDays" component="p" className={errorClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {t("secConfig.ipWhitelist")}
              </label>
              <Field as="textarea" rows={3} name="ipWhitelist" className={inputClass} />
              <ErrorMessage name="ipWhitelist" component="p" className={errorClass} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ConfigToggle
                name="enforceTwoFactor"
                label={t("secConfig.enforce2fa")}
                description={t("secConfig.enforce2faDesc")}
                darkMode={darkMode}
              />
              <ConfigToggle
                name="requireSpecialCharacter"
                label={t("secConfig.specialChar")}
                description={t("secConfig.specialCharDesc")}
                darkMode={darkMode}
              />
              <ConfigToggle
                name="piiMasking"
                label={t("secConfig.piiMasking")}
                description={t("secConfig.piiMaskingDesc")}
                darkMode={darkMode}
              />
              <ConfigToggle
                name="financialShield"
                label={t("secConfig.financialShield")}
                description={t("secConfig.financialShieldDesc")}
                darkMode={darkMode}
              />
              <ConfigToggle
                name="dlpEnforcement"
                label={t("secConfig.dlpEnforcement")}
                description={t("secConfig.dlpEnforcementDesc")}
                darkMode={darkMode}
              />
              <ConfigToggle
                name="panicMode"
                label={t("secConfig.panicMode")}
                description={t("secConfig.panicModeDesc")}
                darkMode={darkMode}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:bg-teal-300"
              >
                {t("secConfig.save")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </SettingCard>
  );
}

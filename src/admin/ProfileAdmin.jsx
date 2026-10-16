import { useState } from "react";
import { loadData, saveDataSections } from "./store";
import { F, Section, Text, Toast } from "./ui";
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from "../services/authService";

function SaveSection({ updates, label, onSave }) {
  return (
    <button className="adm-btn ghost sm" type="button" onClick={() => onSave(updates)}>
      Save {label}
    </button>
  );
}

export default function ProfileAdmin() {
  const [data, setData] = useState(() => loadData());
  const [toast, setToast] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    userIdentifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStep, setPasswordStep] = useState("email");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const saveSection = (updates) => {
    setToast(saveDataSections(updates) ? "Section saved" : "Could not save. Browser storage may be full; remove some images and try again.");
    setTimeout(() => setToast(""), 3500);
  };

  const updateGlobal = (field, value) => setData((current) => ({
    ...current,
    global: { ...current.global, [field]: value },
  }));

  const updatePasswordForm = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === "otp" ? { newPassword: "", confirmPassword: "" } : {}),
    }));
    setPasswordError("");
    setPasswordMessage("");
    if (field === "userIdentifier") setPasswordStep("email");
    if (field === "otp") setPasswordStep("otp");
  };

  const requestPasswordOtp = async (event) => {
    event.preventDefault();
    const email = passwordForm.userIdentifier.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setPasswordError("Enter a valid email address.");
      return;
    }
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      await requestPasswordReset(email);
      setPasswordStep("otp");
      setPasswordMessage("If this email is registered, a reset OTP has been sent.");
    } catch (error) {
      setPasswordError(error.message || "Could not request a reset OTP. Please try again.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const verifyPasswordOtp = async (event) => {
    event.preventDefault();
    const userIdentifier = passwordForm.userIdentifier.trim();
    const otp = passwordForm.otp.trim();
    if (!otp) {
      setPasswordError("Enter the OTP sent to your email.");
      return;
    }
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      await verifyPasswordResetOtp(userIdentifier, otp);
      setPasswordStep("password");
      setPasswordMessage("OTP verified. You can now choose a new password.");
    } catch (error) {
      setPasswordError(error.message || "OTP verification failed. Please check the code and try again.");
    } finally {
      setPasswordBusy(false);
    }
  };

  const submitPasswordReset = async (event) => {
    event.preventDefault();
    if (!passwordForm.newPassword) {
      setPasswordError("Enter a new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("The passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordMessage("");
    try {
      await resetPassword(
        passwordForm.userIdentifier.trim(),
        passwordForm.otp.trim(),
        passwordForm.newPassword,
      );
      setPasswordForm((current) => ({
        ...current,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPasswordStep("done");
      setPasswordMessage("Your password has been reset successfully.");
    } catch (error) {
      if (error.message?.toLowerCase().includes("verify your otp")) {
        setPasswordStep("otp");
      }
      setPasswordError(error.message || "Could not reset your password. Please try again.");
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>Manage business contact details. Save this section after editing.</p>
      </div>

      <Section title="Business contact details" sub="Used by contact and WhatsApp buttons across the website."
        right={<SaveSection
          updates={[
            { path: "global.whatsapp", value: data.global.whatsapp },
            { path: "global.phone", value: data.global.phone },
          ]}
          label="contact details" onSave={saveSection} />}>
        <div className="adm-grid2">
          <Text label="WhatsApp number (country code + number, no +)" value={data.global.whatsapp}
            onChange={(value) => updateGlobal("whatsapp", value)} />
          <Text label="Display phone" value={data.global.phone}
            onChange={(value) => updateGlobal("phone", value)} />
        </div>
      </Section>

      <Section
        title="Reset admin password"
        sub="Request an OTP by email, verify it, then choose a new password."
      >
        {passwordStep === "done" ? (
          <div>
            <p className="adm-form-message success" role="status">{passwordMessage}</p>
            <button
              className="adm-btn ghost"
              type="button"
              onClick={() => {
                setPasswordForm({ userIdentifier: "", otp: "", newPassword: "", confirmPassword: "" });
                setPasswordStep("email");
                setPasswordMessage("");
                setPasswordError("");
              }}
            >
              Reset another password
            </button>
          </div>
        ) : (
          <form
            className="adm-password-reset-form"
            onSubmit={passwordStep === "email" ? requestPasswordOtp : passwordStep === "otp" ? verifyPasswordOtp : submitPasswordReset}
          >
            <div className="adm-grid2">
              <F label="Email address">
                <input
                  type="email"
                  autoComplete="email"
                  value={passwordForm.userIdentifier}
                  onChange={updatePasswordForm("userIdentifier")}
                  required
                  disabled={passwordStep !== "email"}
                />
              </F>
              {passwordStep !== "email" && (
                <F label="OTP">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={passwordForm.otp}
                    onChange={updatePasswordForm("otp")}
                    required
                  />
                </F>
              )}
              {passwordStep === "password" && (
                <>
                  <F label="New password">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={updatePasswordForm("newPassword")}
                      required
                    />
                  </F>
                  <F label="Confirm new password">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={updatePasswordForm("confirmPassword")}
                      required
                    />
                  </F>
                </>
              )}
            </div>
            {passwordError && <p className="adm-form-message error" role="alert">{passwordError}</p>}
            {passwordMessage && <p className="adm-form-message success" role="status">{passwordMessage}</p>}
            <button className="adm-btn" type="submit" disabled={passwordBusy}>
              {passwordBusy
                ? passwordStep === "email" ? "Sending OTP..." : passwordStep === "otp" ? "Verifying OTP..." : "Resetting password..."
                : passwordStep === "email" ? "Send reset OTP" : passwordStep === "otp" ? "Verify OTP" : "Reset password"}
            </button>
            {passwordStep !== "email" && (
              <button
                className="adm-btn ghost"
                type="button"
                disabled={passwordBusy}
                onClick={() => {
                  setPasswordStep("email");
                  setPasswordForm((current) => ({ ...current, otp: "", newPassword: "", confirmPassword: "" }));
                  setPasswordError("");
                  setPasswordMessage("");
                }}
              >
                Change email
              </button>
            )}
          </form>
        )}
      </Section>

      <Toast text={toast} />
    </>
  );
}

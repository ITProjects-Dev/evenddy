import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from "../services/authService";

export default function AdminForgot() {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === "otp" ? { newPassword: "", confirmPassword: "" } : {}),
    }));
    setError("");
    setMessage("");
    if (field === "email") setStep("email");
    if (field === "otp") setStep("otp");
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await requestPasswordReset(email);
      setStep("otp");
      setMessage("If this email is registered, a reset OTP has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Could not request a reset OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const otp = form.otp.trim();
    if (!otp) {
      setError("Enter the OTP sent to your email.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await verifyPasswordResetOtp(email, otp);
      setStep("password");
      setMessage("OTP verified. You can now choose a new password.");
    } catch (requestError) {
      setError(requestError.message || "OTP verification failed. Please check the code and try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitPasswordReset = async (event) => {
    event.preventDefault();
    if (!form.newPassword) {
      setError("Enter a new password.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      await resetPassword(form.email.trim(), form.otp.trim(), form.newPassword);
      setStep("done");
      setMessage("Your password has been reset successfully.");
    } catch (requestError) {
      if (requestError.message?.toLowerCase().includes("verify your otp")) {
        setStep("otp");
      }
      setError(requestError.message || "Could not reset your password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    setStep("email");
    setError("");
    setMessage("");
  };

  const submit = step === "email" ? requestOtp : step === "otp" ? verifyOtp : submitPasswordReset;

  return (
    <div className="adm">
      <div className="adm-auth">
        <aside className="adm-auth-brand">
          <div className="adm-logo">
            <img src={logoImage} alt="Evenddy" />{" "}
            <span style={{ opacity: 0.5, fontWeight: 500 }}>Admin</span>
          </div>
          <div className="adm-auth-hero">
            <h1>Reset your <em>password</em> securely.</h1>
            <p>
              Verify your email with a one-time password, then choose a new password.
            </p>
          </div>
          <div className="adm-auth-foot">
            © {new Date().getFullYear()} Evenddy. Admin console v1.0
          </div>
        </aside>

        <main className="adm-auth-panel">
          <div className="adm-auth-card">
            {step === "done" ? (
              <div style={{ textAlign: "center", paddingTop: 10 }}>
                <div
                  style={{
                    width: 62, height: 62, borderRadius: "50%",
                    margin: "0 auto 20px",
                    background: "#e6f6ee", color: "#0b7a45",
                    display: "grid", placeItems: "center", fontSize: 30,
                  }}
                >
                  <Check size={28} strokeWidth={2} />
                </div>
                <h2>Password reset</h2>
                <p className="sub">{message}</p>
                <Link className="adm-btn block" to="/admin/login" style={{ marginTop: 8 }}>
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <Link className="adm-linkbtn adm-back-link" to="/admin/login">
                  <ArrowLeft size={15} /> Back to sign in
                </Link>
                <h2 style={{ marginTop: 16 }}>Forgot password?</h2>
                <p className="sub">
                  Enter your account email, verify the OTP, and set a new password.
                </p>

                <form onSubmit={submit} noValidate>
                  <div className="adm-field">
                    <label htmlFor="fp-email">Email address <i>*</i></label>
                    <input
                      id="fp-email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="admin@evenddy.com"
                      autoComplete="email"
                      autoFocus
                      required
                      disabled={step !== "email"}
                    />
                  </div>

                  {step !== "email" && (
                    <div className="adm-field">
                      <label htmlFor="fp-otp">OTP <i>*</i></label>
                      <input
                        id="fp-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={form.otp}
                        onChange={update("otp")}
                        required
                      />
                    </div>
                  )}

                  {step === "password" && (
                    <>
                      <div className="adm-field">
                        <label htmlFor="fp-new-password">New password <i>*</i></label>
                        <input
                          id="fp-new-password"
                          type="password"
                          autoComplete="new-password"
                          value={form.newPassword}
                          onChange={update("newPassword")}
                          required
                        />
                      </div>
                      <div className="adm-field">
                        <label htmlFor="fp-confirm-password">Confirm new password <i>*</i></label>
                        <input
                          id="fp-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={form.confirmPassword}
                          onChange={update("confirmPassword")}
                          required
                        />
                      </div>
                    </>
                  )}

                  {error && <p className="adm-form-message error" role="alert">{error}</p>}
                  {message && <p className="adm-form-message success" role="status">{message}</p>}
                  <button className="adm-btn block" type="submit" disabled={busy}>
                    {busy
                      ? step === "email" ? "Sending OTP..." : step === "otp" ? "Verifying OTP..." : "Resetting password..."
                      : step === "email" ? "Send reset OTP" : step === "otp" ? "Verify OTP" : "Reset password"}
                  </button>
                  {step !== "email" && (
                    <button
                      className="adm-btn ghost block"
                      type="button"
                      style={{ marginTop: 10 }}
                      disabled={busy}
                      onClick={resetForm}
                    >
                      Change email
                    </button>
                  )}
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

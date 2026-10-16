import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";
import { createInitialUser } from "../services/userService";

const INITIAL_FORM = {
  username: "",
  mobileNo: "",
  email: "",
  password: "",
};

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.mobileNo)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createInitialUser({ ...form, mobileNo: Number(form.mobileNo), roleIds: [] });
      navigate("/admin/login", { replace: true, state: { registered: true } });
    } catch (requestError) {
      setError(requestError.message || "Could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm">
      <div className="adm-auth">
        <aside className="adm-auth-brand">
          <div className="adm-logo">
            <img src={logoImage} alt="Evenddy" />{" "}
            <span style={{ opacity: 0.5, fontWeight: 500 }}>Admin</span>
          </div>
          <div className="adm-auth-hero">
            <h1>Get started with <em>Evenddy.</em></h1>
            <p>Create the first user account to access the Evenddy console.</p>
          </div>
          <div className="adm-auth-foot">
            © {new Date().getFullYear()} Evenddy. Admin console v1.0
          </div>
        </aside>

        <main className="adm-auth-panel">
          <div className="adm-auth-card adm-register-card">
            <Link className="adm-linkbtn adm-back-link" to="/admin/login">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
            <h2 style={{ marginTop: 16 }}>Create account</h2>
            <p className="sub">Register the first user with the account details used for authentication.</p>
            <form onSubmit={submit}>
              <div className="adm-grid2">
                <Field label="Username" required>
                  <input value={form.username} onChange={update("username")} autoComplete="username" required />
                </Field>
                <Field label="Email address" required>
                  <input type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
                </Field>
                <Field label="Mobile number" required>
                  <input type="tel" inputMode="numeric" maxLength={10} value={form.mobileNo} onChange={update("mobileNo")} autoComplete="tel" required />
                </Field>
                <Field label="Password" required>
                  <input type="password" value={form.password} onChange={update("password")} autoComplete="new-password" required />
                </Field>
              </div>
              {error && <p className="adm-form-message error" role="alert">{error}</p>}
              <button className="adm-btn block" type="submit" disabled={busy}>
                <UserPlus size={16} /> {busy ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="adm-field">
      <label>{label}{required && <i> *</i>}</label>
      {children}
    </div>
  );
}

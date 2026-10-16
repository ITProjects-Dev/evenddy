import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";

export default function AdminLogin({ onLogin, notice = "" }) {
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [requestError, setRequestError] = useState(notice);
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.username.trim()) v.username = "Enter your username";
    if (!form.password) v.password = "Enter your password";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    setRequestError("");
    try {
      await onLogin?.({ username: form.username.trim(), password: form.password, remember: form.remember });
      nav("/admin/dashboard", { replace: true });
    } catch (error) {
      setRequestError(error.message || "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
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
            <h1>Run your <em>celebrations</em> from one place.</h1>
            <p>
              Manage catering, decor and event management services — update menus,
              pricing, galleries and availability without touching code.
            </p>
            <ul className="adm-auth-points">
              <li><span className="tick">✓</span> Add &amp; edit services by category</li>
              <li><span className="tick">✓</span> Manage pricing, inclusions &amp; galleries</li>
              <li><span className="tick">✓</span> Publish or keep as draft instantly</li>
            </ul>
          </div>

          <div className="adm-auth-foot">
            © {new Date().getFullYear()} Evenddy. Admin console v1.0
          </div>
        </aside>

        <main className="adm-auth-panel">
          <div className="adm-auth-card">
            <h2>Welcome back</h2>
            <p className="sub">Sign in to manage your services and user accounts.</p>

            {location.state?.registered && (
              <p className="adm-form-message success" role="status">Account created successfully. Sign in to continue.</p>
            )}
            <form onSubmit={submit} noValidate>
              <div className="adm-field">
                <label htmlFor="adm-username">Username <i>*</i></label>
                <input
                  id="adm-username"
                  type="text"
                  className={errors.username ? "err" : ""}
                  value={form.username}
                  onChange={set("username")}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
                {errors.username && <small className="adm-err" role="alert">{errors.username}</small>}
              </div>

              <div className="adm-field">
                <label htmlFor="adm-pass">Password <i>*</i></label>
                <div className="adm-password-wrap">
                  <input
                    id="adm-pass"
                    type={show ? "text" : "password"}
                    className={`password-input${errors.password ? " err" : ""}`}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    className="adm-password-toggle"
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <small className="adm-err" role="alert">{errors.password}</small>}
              </div>

              <div className="adm-between" style={{ margin: "4px 0 22px" }}>
                <label className="adm-checkline">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  />
                  Remember me
                </label>
                <Link className="adm-linkbtn" to="/admin/forgot">Forgot password?</Link>
              </div>

              {requestError && <p className="adm-form-message error" role="alert">{requestError}</p>}
              <button className="adm-btn block" type="submit" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="adm-hint adm-login-register">
              First time here? <Link className="adm-linkbtn" to="/admin/register">Create an account</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";

export default function AdminLogin({ onLogin }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const v = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email = "Enter a valid email address";
    if (form.password.length < 6) v.password = "Password must be at least 6 characters";
    setErrors(v);
    if (Object.keys(v).length) return;
    onLogin?.({ email: form.email });
    nav("/admin/dashboard", { replace: true });
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
            <p className="sub">Sign in to manage your services and enquiries.</p>

            <form onSubmit={submit} noValidate>
              <div className="adm-field">
                <label htmlFor="adm-email">Email address <i>*</i></label>
                <input
                  id="adm-email"
                  type="email"
                  className={errors.email ? "err" : ""}
                  value={form.email}
                  onChange={set("email")}
                  placeholder="admin@evenddy.com"
                  autoComplete="email"
                />
                {errors.email && <small className="adm-err" role="alert">{errors.email}</small>}
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

              <button className="adm-btn block" type="submit">Sign in</button>
            </form>

            <p className="adm-hint" style={{ marginTop: 18, textAlign: "center" }}>
              Static demo — any valid email + 6-char password works.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
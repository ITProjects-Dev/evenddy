import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";

export default function AdminForgot() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
    setError("");
    setSent(true);
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
            <h1>Reset your <em>password</em> securely.</h1>
            <p>
              We'll email you a secure link to set a new password. The link expires
              in 30 minutes.
            </p>
          </div>
          <div className="adm-auth-foot">
            © {new Date().getFullYear()} Evenddy. Admin console v1.0
          </div>
        </aside>

        <main className="adm-auth-panel">
          <div className="adm-auth-card">
            {!sent ? (
              <>
                <Link className="adm-linkbtn adm-back-link" to="/admin/login"><ArrowLeft size={15} /> Back to sign in</Link>
                <h2 style={{ marginTop: 16 }}>Forgot password?</h2>
                <p className="sub">
                  Enter the email linked to your admin account and we'll send a reset link.
                </p>

                <form onSubmit={submit} noValidate>
                  <div className="adm-field">
                    <label htmlFor="fp-email">Email address <i>*</i></label>
                    <input
                      id="fp-email"
                      type="email"
                      className={error ? "err" : ""}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@evenddy.com"
                      autoComplete="email"
                      autoFocus
                    />
                    {error && <small className="adm-err" role="alert">{error}</small>}
                  </div>
                  <button className="adm-btn block" type="submit">Send reset link</button>
                </form>
              </>
            ) : (
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
                <h2>Check your inbox</h2>
                <p className="sub">
                  We've sent a password reset link to <b>{email}</b>. It expires in 30 minutes.
                </p>
                <Link className="adm-btn block" to="/admin/login" style={{ marginTop: 8 }}>
                  Back to sign in
                </Link>
                <button
                  className="adm-linkbtn"
                  style={{ marginTop: 16 }}
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Didn't get it? Try again
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
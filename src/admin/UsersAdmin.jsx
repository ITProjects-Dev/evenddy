import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { createUser } from "../services/userService";

const INITIAL_FORM = {
  username: "",
  mobileNo: "",
  email: "",
  password: "",
};

export default function UsersAdmin() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.mobileNo)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createUser({
        ...form,
        mobileNo: Number(form.mobileNo),
        roleIds: [],
      });
      setForm(INITIAL_FORM);
      setSuccess("User created successfully.");
    } catch (requestError) {
      setError(requestError.message || "Could not create the user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="adm-card adm-user-create">
      <div className="adm-card-h">
        <div className="adm-user-create-icon"><UserPlus size={20} /></div>
        <div>
          <h3>Create a user</h3>
          <p>Add a user account using the authentication details.</p>
        </div>
      </div>
      <form className="adm-card-b" onSubmit={submit}>
        <div className="adm-grid2">
          <Field label="Username" required>
            <input value={form.username} onChange={update("username")} autoComplete="username" required />
          </Field>
          <Field label="Email address" required>
            <input type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
          </Field>
          <Field label="Mobile number" required>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobileNo}
              onChange={update("mobileNo")}
              autoComplete="tel"
              required
            />
          </Field>
          <Field label="Temporary password" required>
            <input type="password" value={form.password} onChange={update("password")} autoComplete="new-password" required />
          </Field>
        </div>
        {error && <p className="adm-form-message error" role="alert">{error}</p>}
        {success && <p className="adm-form-message success" role="status"><Check size={16} />{success}</p>}

        <div className="adm-user-create-actions">
          <p className="adm-hint">New accounts are created with the default user role.</p>
          <button className="adm-btn" type="submit" disabled={saving}>
            <UserPlus size={16} /> {saving ? "Creating user..." : "Create user"}
          </button>
        </div>
      </form>
    </section>
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

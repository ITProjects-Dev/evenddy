export const MAIL_TO = "info@evenddy.com";
export const WEB3FORMS_KEY = "PASTE_YOUR_ACCESS_KEY_HERE";

export async function sendMail({ subject, lines = [], replyTo }) {
  const message = lines.filter(Boolean).join("\n");

  if (WEB3FORMS_KEY && WEB3FORMS_KEY !== "PASTE_YOUR_ACCESS_KEY_HERE") {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: "Evenddy Website",
        message,
        ...(replyTo ? { email: replyTo } : {}),
      }),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {}
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Mail request failed (" + res.status + ")");
    }
    return { via: "web3forms" };
  }

  const gmail =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(MAIL_TO)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`;
  const a = document.createElement("a");
  a.href = gmail;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return { via: "gmail" };
}
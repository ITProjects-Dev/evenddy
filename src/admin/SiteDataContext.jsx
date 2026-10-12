import { createContext, useContext, useEffect, useState } from "react";
import { loadData } from "./store";

const Ctx = createContext(null);

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    /* Re-read store when:
       - another tab writes to localStorage
       - this tab regains focus (user switched back from admin tab) */
    const reread = () => setData(loadData());
    const onStorage = (e) => {
      if (!e.key || e.key === "evenddy_admin_v2") reread();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", reread);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", reread);
    };
  }, []);

  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useSiteData = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSiteData must be used inside <SiteDataProvider>");
  return v;
};
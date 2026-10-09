import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
    CalendarDays,
    Flower2,
    LayoutDashboard,
    LogOut,
    Menu,
    Utensils,
    X,
} from "lucide-react";
import logoImage from "../assets/evenddy-logo.svg";

const NAV = [
    {
        group: "Overview", items: [
            { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ]
    },
    {
        group: "Manage", items: [
            { to: "/admin/catering", icon: Utensils, label: "Catering" },
            { to: "/admin/decor", icon: Flower2, label: "Decor" },
            { to: "/admin/event", icon: CalendarDays, label: "Event Management" },
        ]
    },
    //   { group: "Other", items: [
    //     { to: "/admin/enquiries", icon: "✉", label: "Enquiries" },
    //     { to: "/admin/settings",  icon: "⚙", label: "Settings" },
    //   ]},
];

const TITLES = {
    "/admin/dashboard": ["Dashboard", "Overview of your services and enquiries"],
    "/admin/catering": ["Catering", "Manage Meal Box, Delivery Box and Full Catering"],
    "/admin/decor": ["Decor", "Manage DIY kits, themes and custom decor"],
    "/admin/event": ["Event Management", "Manage event types, priorities and landing"],
    //   "/admin/enquiries": ["Enquiries", "Customer enquiries and quote requests"],
    //   "/admin/settings":  ["Settings", "Workspace preferences"],
};

export default function AdminLayout({ onLogout, user }) {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const base = Object.keys(TITLES).find((k) => pathname.startsWith(k)) || "/admin/dashboard";
    const [title, sub] = TITLES[base];
    const initials = (user?.email || "AD").slice(0, 2).toUpperCase();

    return (
        <div className="adm">
            <div className="adm-shell">
                {open && <div className="adm-backdrop" onClick={() => setOpen(false)} />}
                <aside className={`adm-side ${open ? "open" : ""}`}>
                    <NavLink className="adm-brand" to="/admin/dashboard" aria-label="Evenddy Admin home">
                        <img src={logoImage} alt="Evenddy" />
                        <span>Admin</span>
                    </NavLink>
                    <nav className="adm-nav">
                        {NAV.map((g) => (
                            <div key={g.group}>
                                <div className="adm-nav-group">{g.group}</div>
                                {g.items.map((n) => (
                                    <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
                                        end={n.to === "/admin/dashboard"}
                                        className={({ isActive }) => (isActive ? "on" : "")}>
                                        <span className="ic" aria-hidden="true"><n.icon size={18} strokeWidth={1.8} /></span>
                                        {n.label}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>
                    <div className="adm-side-foot">
                        <div className="adm-userchip">
                            <span className="adm-avatar">{initials}</span>
                            <div style={{ minWidth: 0 }}>
                                <b>Admin</b>
                                <small style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {user?.email || "admin@evenddy.com"}
                                </small>
                            </div>
                            <button className="adm-logout" onClick={onLogout} title="Sign out" aria-label="Sign out">
                                <LogOut size={17} strokeWidth={1.8} />
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="adm-main">
                    <header className="adm-top">
                        <button
                            className="adm-burger"
                            onClick={() => setOpen((o) => !o)}
                            aria-label={open ? "Close menu" : "Open menu"}
                            aria-expanded={open}
                        >
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div><div className="crumb">{sub}</div><h1>{title}</h1></div>
                        {/* <label className="adm-search">
                            <span aria-hidden="true">⌕</span>
                            <input placeholder="Search…" aria-label="Search" />
                        </label> */}
                    </header>
                    <div className="adm-body wide"><Outlet /></div>
                </div>
            </div>
        </div>
    );
}
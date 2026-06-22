import { Link, useNavigate } from "react-router-dom";
import {
  getToken,
  getStoredUser,
  clearToken,
  setStoredUser,
} from "../../store/auth";
import { useState, useEffect, useRef } from "react";
import { User, Role } from "../../types";
import api from "../../services/api";

const roleMeta: Record<string, { label: string }> = {
  ADMIN: { label: "Admin" },
  SELLER: { label: "Seller" },
  BUYER: { label: "Buyer" },
  DRIVER: { label: "Driver" },
};

const icons: Record<string, string> = {
  ADMIN: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  SELLER: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
  BUYER: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  DRIVER: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
};

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getToken() && !user) {
      api.get("/auth/profile").then((res) => {
        setStoredUser(res.data.user);
        setUser(res.data.user);
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setRoleOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate("/");
  };

  const handleSwitchRole = async (role: string) => {
    try {
      const res = await api.post("/auth/switch-role", { role });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      setStoredUser({ ...user!, activeRole: role as Role });
      setUser({ ...user!, activeRole: role as Role });
      setRoleOpen(false);
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch {
      /* fallback */
    }
  };

  const dashboardLink = user?.activeRole
    ? `/${user.activeRole.toLowerCase()}/dashboard`
    : user?.roles.length === 1
    ? `/${user.roles[0].toLowerCase()}/dashboard`
    : "/role-select";

  const roles = user?.roles || [];
  const multiRole = roles.length > 1;
  const currentRole = user?.activeRole || roles[0];

  return (
    <nav className="bg-[var(--color-bg-card)]/80 backdrop-blur-md border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--color-primary-600)] tracking-tight">
              SEAPEDIA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/products"
              className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              Products
            </Link>
            <Link
              to="/reviews"
              className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              Reviews
            </Link>

            {user ? (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--color-border)]">
                {multiRole ? (
                  <div className="relative" ref={ref}>
                    <button
                      onClick={() => setRoleOpen(!roleOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-subtle)] text-[var(--color-text)] rounded-lg text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icons[currentRole]} />
                      </svg>
                      <span>{roleMeta[currentRole]?.label}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                          roleOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    {roleOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown,0_10px_15px_-3px_rgb(0_0_0/0.1))] border border-[var(--color-border)] py-1 z-50">
                        {roles.map((r: string) => (
                          <button
                            key={r}
                            onClick={() => handleSwitchRole(r)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
                              r === currentRole
                                ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium"
                                : "text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={icons[r]} />
                            </svg>
                            <span>{roleMeta[r]?.label}</span>
                            {r === currentRole && (
                              <span className="ml-auto">
                                <svg
                                  className="w-4 h-4 text-[var(--color-primary-600)]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] rounded-lg text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icons[currentRole]} />
                    </svg>
                    {roleMeta[currentRole]?.label}
                  </span>
                )}
                <Link
                  to={dashboardLink}
                  className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--color-border)]">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                }
              />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-[var(--color-border)]">
            <Link
              to="/products"
              className="block px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-subtle)]"
            >
              Products
            </Link>
            <Link
              to="/reviews"
              className="block px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-subtle)]"
            >
              Reviews
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardLink}
                  className="block px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-subtle)]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger)]/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-subtle)]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-sm text-[var(--color-primary-600)] font-medium rounded-lg hover:bg-[var(--color-bg-subtle)]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

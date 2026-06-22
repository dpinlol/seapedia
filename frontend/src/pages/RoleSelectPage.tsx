import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { getStoredUser, setStoredUser, setToken } from "../store/auth";
import { Role } from "../types";
import api from "../services/api";

const roleMeta: Record<Role, { label: string; desc: string; icon: string; color: string }> = {
  BUYER: { label: "Buyer", desc: "Shop and purchase products", icon: "shopping-cart", color: "text-blue-600 bg-blue-50" },
  SELLER: { label: "Seller", desc: "Manage your store and products", icon: "store", color: "text-emerald-600 bg-emerald-50" },
  DRIVER: { label: "Driver", desc: "Deliver orders and earn", icon: "truck", color: "text-violet-600 bg-violet-50" },
  ADMIN: { label: "Admin", desc: "Monitor the marketplace", icon: "users", color: "text-orange-600 bg-orange-50" },
};

export function RoleSelectPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  if (!user) {
    navigate("/login");
    return null;
  }

  const availableRoles = user.roles.filter((r: string) => r !== "ADMIN");

  const handleSelect = async (role: Role) => {
    try {
      const res = await api.post("/auth/switch-role", { role });
      setToken(res.data.token);
      setStoredUser({ ...user, activeRole: role });
    } catch {
      setStoredUser({ ...user, activeRole: role });
    }
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-bold text-surface-900">Choose Your Role</h1>
          <p className="text-sm text-surface-400 mt-1">
            Hi <span className="font-medium text-surface-700">{user.username}</span>, which role would you like to use?
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableRoles.map((role: string) => {
            const meta = roleMeta[role as Role];
            return (
              <button
                key={role}
                onClick={() => handleSelect(role as Role)}
                className="w-full flex items-center gap-4 p-4 border border-surface-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-150 text-left group"
              >
                <div className={`w-11 h-11 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <use href={`#icon-${meta.icon}`} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900 group-hover:text-primary-700 transition-colors">
                    {meta.label}
                  </p>
                  <p className="text-sm text-surface-500">{meta.desc}</p>
                </div>
                <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

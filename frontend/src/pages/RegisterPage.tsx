import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Role } from "../types";
import api from "../services/api";
import { setToken, setStoredUser } from "../store/auth";

const roleOptions: { value: Role; label: string }[] = [
  { value: "BUYER", label: "Buyer" },
  { value: "SELLER", label: "Seller" },
  { value: "DRIVER", label: "Driver" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roles: [] as Role[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: Role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      setError("Select at least one role");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", form);
      setToken(res.data.token);
      const user = res.data.user;
      setStoredUser(user);
      if (user.roles.length === 1) {
        navigate(`/${user.roles[0].toLowerCase()}/dashboard`);
      } else {
        navigate("/role-select");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-bold text-surface-900">Create Account</h1>
          <p className="text-sm text-surface-400 mt-1">Join SEAPEDIA today.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <use href="#icon-alert-circle" />
                </svg>
                {error}
              </div>
            )}
            <Input
              label="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              required
              placeholder="Choose a username"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              placeholder="Min 6 characters"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-700">
                I want to join as
              </label>
              <div className="flex gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRole(opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                      form.roles.includes(opt.value)
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "border-surface-300 text-surface-600 hover:border-surface-400 hover:bg-surface-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>
          <p className="text-sm text-surface-400 mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

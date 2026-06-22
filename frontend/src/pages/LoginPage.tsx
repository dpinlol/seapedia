import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import api from "../services/api";
import { setToken, setStoredUser } from "../store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      setToken(res.data.token);
      setStoredUser(res.data.user);
      const user = res.data.user;
      if (user.roles.length === 1) {
        navigate(`/${user.roles[0].toLowerCase()}/dashboard`);
      } else {
        navigate("/role-select");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-bold text-surface-900">Login to SEAPEDIA</h1>
          <p className="text-sm text-surface-400 mt-1">Welcome back! Enter your credentials.</p>
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
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="Enter your username"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Login
            </Button>
          </form>
          <p className="text-sm text-surface-400 mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

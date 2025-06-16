import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userId.trim()) {
      localStorage.setItem("login_token", userId);
      navigate("/", { replace: true });
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64">
        <input
          type="text"
          placeholder="Enter your ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </main>
  );
}

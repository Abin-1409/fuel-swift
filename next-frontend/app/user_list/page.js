"use client";
import { useEffect, useState } from "react";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("http://localhost:8000/api/users/");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filter out admin/staff users and apply search
  const filteredUsers = users
    .filter((user) => !user.is_staff)
    .filter(
      (user) =>
        user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: "DELETE",
      });
      let data = {};
      if (res.status !== 204) {
        data = await res.json().catch(() => ({}));
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Users</h1>
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-shadow relative"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 mr-4">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-blue-600">{user.email}</div>
                  </div>
                </div>
                <div className="text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {user.phone_number}
                </div>
                <div className="text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {user.address || <span className="italic text-gray-400">N/A</span>}
                </div>
                <div className="mt-2 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  className={`absolute top-4 right-4 px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition-colors ${deletingId === user.id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {deletingId === user.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

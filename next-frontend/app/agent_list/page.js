"use client";
import { useEffect, useState } from "react";

function getInitials(name) {
  if (!name) return "A";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-yellow-500"
];

export default function AgentList() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredAgents(agents);
    } else {
      const s = search.toLowerCase();
      setFilteredAgents(
        agents.filter(
          (a) =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(s) ||
            a.email.toLowerCase().includes(s) ||
            a.phone_number.toLowerCase().includes(s)
        )
      );
    }
  }, [search, agents]);

  const fetchAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/users/");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.filter((u) => u.user_type === "agent"));
      } else {
        setError("Failed to fetch agents.");
      }
    } catch (err) {
      setError("Failed to fetch agents.");
    }
    setLoading(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`http://localhost:8000/api/users/${deleteId}/`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setSuccess("Agent deleted successfully.");
        setAgents((prev) => prev.filter((a) => a.id !== deleteId));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete agent.");
      }
    } catch (err) {
      setError("Failed to delete agent.");
    }
    setShowModal(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Registered Agents</h1>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
        {loading ? (
          <div className="text-blue-700 text-center">Loading...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-gray-700 text-center">No agents found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {filteredAgents.map((agent, idx) => (
                  <tr key={agent.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3 font-semibold text-blue-900">
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-md ${avatarColors[agent.id % avatarColors.length]}`}>{getInitials(`${agent.first_name} ${agent.last_name}`)}</span>
                      <span>{agent.first_name} {agent.last_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{agent.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{agent.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-red-700 mb-4">Confirm Delete</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete this agent? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => { setShowModal(false); setDeleteId(null); }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

export default function AgentRegistration() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    idProofType: "",
    idProofNumber: "",
    idProofFile: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusEmail, setStatusEmail] = useState("");
  const [statusResult, setStatusResult] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, idProofFile: files[0] }));
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(files[0]);
      } else {
        setFilePreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    if (!form.fullName || !form.phone || !form.email || !form.password || !form.idProofType || !form.idProofNumber || !form.idProofFile) {
      setError("Please fill in all fields and upload your ID proof.");
      setSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("full_name", form.fullName);
      formData.append("phone_number", form.phone);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("id_proof_type", form.idProofType);
      formData.append("id_proof_number", form.idProofNumber);
      formData.append("id_proof_file", form.idProofFile);

      const res = await fetch("http://localhost:8000/api/agent-registration-request/", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess("Registration request submitted, pending admin approval.");
        setForm({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          idProofType: "",
          idProofNumber: "",
          idProofFile: null,
        });
        setFilePreview(null);
      } else {
        const data = await res.json();
        if (
          data.message &&
          (data.message.includes("User with this phone number already exists") ||
            data.message.includes("User with this email already exists"))
        ) {
          setSuccess("Registration successful! You can now login.");
        } else if (data.message && data.message.toLowerCase().includes("pending")) {
          setSuccess("Registration request submitted, pending admin approval.");
        } else {
          setError(data.message || "Failed to submit registration request.");
        }
      }
    } catch (err) {
      setError("Failed to submit registration request.");
    }
    setSubmitting(false);
  };

  const handleCheckStatus = async () => {
    setStatusResult("");
    if (!statusEmail) {
      setStatusResult("Please enter your email to check status.");
      return;
    }
    setCheckingStatus(true);
    try {
      const res = await fetch(`http://localhost:8000/api/agent-registration-status/?email=${encodeURIComponent(statusEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "approved") {
          setStatusResult("Your registration is approved! You can now login.");
        } else if (data.status === "pending") {
          setStatusResult("Your registration is still pending.");
        } else if (data.status === "rejected") {
          setStatusResult("Your registration request was rejected.");
        } else {
          setStatusResult(data.message || "No registration found for this email.");
        }
      } else {
        setStatusResult("Failed to check status.");
      }
    } catch (err) {
      setStatusResult("Failed to check status.");
    }
    setCheckingStatus(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Agent Registration</h1>
        {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
            {success}
            {success.toLowerCase().includes("login") && (
              <div className="mt-2">
                <a href="/login" className="text-blue-700 underline font-semibold">Login</a>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" 
                required 
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-700 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="text-xl">{showPassword ? "👁️‍🗨️" : "👁️"}</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">ID Proof Type</label>
            <select name="idProofType" value={form.idProofType} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" required>
              <option value="">Select ID Proof</option>
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
              <option value="driving">Driving License</option>
              <option value="voter">Voter ID</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">ID Proof Number</label>
            <input type="text" name="idProofNumber" value={form.idProofNumber} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Upload ID Proof</label>
            <input type="file" name="idProofFile" accept="image/*,.pdf" onChange={handleChange} className="w-full" required />
            {filePreview && (
              <div className="mt-2">
                <span className="block text-xs text-blue-700 mb-1">Preview:</span>
                <img src={filePreview} alt="ID Preview" className="max-h-32 rounded border" />
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-8">
          <label className="block text-sm font-medium text-blue-900 mb-1">Check Status</label>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              placeholder="Enter your email"
              value={statusEmail}
              onChange={e => setStatusEmail(e.target.value)}
              className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {checkingStatus ? "Checking..." : "Check Status"}
            </button>
          </div>
          {statusResult && (
            <div className="mt-2 text-blue-900 font-semibold">
              {statusResult}
              {statusResult.toLowerCase().includes("approved") && (
                <div className="mt-1">
                  <a href="/login" className="text-blue-700 underline font-semibold">Login</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyAccountPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone_number: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  // Get user email from localStorage
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") : null;

  useEffect(() => {
    if (userType && userType !== "user") {
      // Redirect agents/admins away from this page
      router.replace("/");
    }
  }, [userType, router]);

  // Fetch bookings for this user
  useEffect(() => {
    async function fetchBookings() {
      setLoadingBookings(true);
      setBookingError("");
      try {
        const res = await fetch("http://localhost:8000/api/service-requests/");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        // Filter bookings for this user
        const userBookings = data.filter(b => b.user_email === userEmail);
        setBookings(userBookings);
      } catch (err) {
        setBookingError(err.message);
      } finally {
        setLoadingBookings(false);
      }
    }
    if (userEmail) fetchBookings();
  }, [userEmail]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true);
      setProfileError("");
      try {
        const res = await fetch("http://localhost:8000/api/users/");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const users = await res.json();
        const user = users.find(u => u.email === userEmail);
        if (user) {
          setProfile({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone_number: user.phone_number || "",
          });
        }
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    }
    if (userEmail) fetchProfile();
  }, [userEmail]);



  // Handle booking cancel
  const handleCancel = async (bookingId) => {
    setCancelingId(bookingId);
    setBookingError("");
    try {
      const res = await fetch(`http://localhost:8000/api/service-requests/${bookingId}/update-status/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      
      // Get the updated request from the response
      const data = await res.json();
      if (data.request) {
        // Update the specific booking with the returned data
        const updated = bookings.map(b => b.id === bookingId ? {
          ...b,
          status: data.request.status,
          assigned_agent: data.request.assigned_agent
        } : b);
        setBookings(updated);
      } else {
        // Fallback to the old method if the response format is different
        const updated = bookings.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b);
        setBookings(updated);
      }
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  const canCancel = status => ["pending", "assigned"].includes((status || "").toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">My Account</h1>
        {/* Bookings Section */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Your Bookings</h2>
          {loadingBookings ? (
            <div>Loading bookings...</div>
          ) : bookingError ? (
            <div className="text-red-500">{bookingError}</div>
          ) : bookings.length === 0 ? (
            <div className="text-gray-500">No bookings found.</div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50">
                  <div>
                    <div className="font-semibold text-blue-900">{booking.service_type?.toUpperCase() || "Service"}</div>
                    <div className="text-sm text-gray-700">Vehicle: {booking.vehicle_type} - {booking.vehicle_number}</div>
                    <div className="text-sm text-gray-700">Status: <span className="font-bold capitalize">{booking.status}</span></div>
                    <div className="text-sm text-gray-700">Amount: ₹{booking.total_amount}</div>
                    <div className="text-xs text-gray-500">#{booking.id}</div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-2">
                    <button
                      className={`px-4 py-2 rounded-md text-white font-semibold ${canCancel(booking.status) ? "bg-red-500 hover:bg-red-600" : "bg-gray-300 cursor-not-allowed"}`}
                      onClick={() => handleCancel(booking.id)}
                      disabled={!canCancel(booking.status) || cancelingId === booking.id}
                    >
                      {cancelingId === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Profile Section */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Your Profile</h2>
          {profileLoading ? (
            <div>Loading profile...</div>
          ) : profileError ? (
            <div className="text-red-500">{profileError}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <div className="font-semibold text-blue-900">{profile.first_name} {profile.last_name}</div>
                  <div className="text-sm text-gray-700">Phone: {profile.phone_number}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

const YOUTUBE_API_KEY = 'AIzaSyCboShNfFrquCOcjUJtEJgrd_FBGF0M2g0';

export default function SearchPage() {
  const [vehicleType, setVehicleType] = useState('');
  const [problem, setProblem] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setVideos([]);
    setLoading(true);
    setSearched(true);

    const query = `${vehicleType} ${problem} repair tutorial`;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setVideos(data.items);
      } else {
        setVideos([]);
        setError('No videos found. Try a different query.');
      }
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-10 px-2 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/tool/tool.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full max-w-2xl flex flex-col items-center mb-10">
          <div className="bg-blue-100 rounded-full p-4 mb-4 shadow-sm">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m4 4h1a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2h1m4 0v2a2 2 0 11-4 0v-2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Vehicle Self-Repair Search</h1>
          <p className="text-white-500 text-center mb-2 max-w-lg">Describe your vehicle and the problem. Instantly get the best YouTube tutorials to help you fix it yourself.</p>
        </div>
        {/* Search Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type <span className="text-red-500"></span></label>
              <input
                type="text"
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Problem <span className="text-red-500"></span></label>
              <input
                type="text"
                value={problem}
                onChange={e => setProblem(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-gray-50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-150"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Searching...
                </span>
              ) : 'Search'}
            </button>
          </form>
          {error && <div className="mt-4 text-red-600 text-center font-medium">{error}</div>}
        </div>
        {/* Results Section */}
        {searched && !loading && videos.length === 0 && !error && (
          <div className="flex flex-col items-center mt-8">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 21l3-1.5L15 21l-.75-4M9 13h6m-6 4h6m-7-8h8a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            <p className="text-gray-400 text-base text-center">No videos found for your query.<br/>Try a different problem description.</p>
          </div>
        )}
        {videos.length > 0 && (
          <div className="w-full max-w-3xl mt-4">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Suggested Videos</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((video) => (
                <a
                  key={video.id.videoId}
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition-all p-3 group"
                >
                  <div className="relative w-full h-44 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url}
                      alt={video.snippet.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 bg-white/80 text-xs text-gray-700 px-2 py-0.5 rounded shadow">YouTube</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="font-semibold text-gray-900 text-base group-hover:text-blue-700 transition-colors mb-1 line-clamp-2">{video.snippet.title}</div>
                    <div className="text-xs text-gray-500 mb-1">{video.snippet.channelTitle}</div>
                    <div className="text-xs text-gray-400">{new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

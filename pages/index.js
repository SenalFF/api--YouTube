import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [dark, setDark] = useState(true);

  const toggleTheme = () => setDark(!dark);

  const search = async () => {
    if (!query.trim()) return;
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      setVideo(res.data);
    } catch (err) {
      alert("Search failed");
    }
  };

  const handleDownload = async (type) => {
    try {
      const res = await axios.get(`/api/download?url=${video.url}&type=${type}`);
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = `${video.title}.${type}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">📥 YouTube Downloader</h1>
          <button onClick={toggleTheme} className="px-3 py-1 border rounded">
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Paste link or search YouTube"
            className="flex-1 p-2 text-black rounded"
          />
          <button
            onClick={search}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {video && (
          <div className="mt-6 space-y-3">
            <iframe
              className="w-full aspect-video rounded"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              allowFullScreen
            ></iframe>

            <h2 className="text-xl font-semibold">{video.title}</h2>
            <p>👁️ {video.views} | 👍 {video.likes} | ⏱ {video.duration} | 📅 {video.uploadedAt}</p>

            <div className="text-sm text-gray-400">
              Estimated: MP3 ~ {video.mp3Size}, MP4 ~ {video.mp4Size}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleDownload("mp3")}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                🎵 Download MP3
              </button>
              <button
                onClick={() => handleDownload("mp4")}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                🎥 Download MP4
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

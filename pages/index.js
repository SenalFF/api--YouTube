import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [progress, setProgress] = useState(null);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const searchVideo = async () => {
    try {
      const res = await axios.get(`/api/search?q=${query}`);
      setVideo(res.data);
    } catch (error) {
      alert("Search failed");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchVideo();
    }
  };

  const downloadFile = async (format) => {
    try {
      setProgress(0);
      const res = await axios.get(`/api/download?url=${video.url}&type=${format}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${video.title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setProgress(null);
    } catch (error) {
      alert("Download failed");
      setProgress(null);
    }
  };

  return (
    <div className={`${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} min-h-screen p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🎵 YouTube Downloader</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-1 rounded bg-gray-600 text-white hover:bg-gray-800"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Search YouTube video..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border rounded text-black"
        />
        <button onClick={searchVideo} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800">
          Search
        </button>
      </div>

      {video && (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
          <div className="mb-4">
            <iframe
              width="100%"
              height="250"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded"
            ></iframe>
          </div>

          <div className="mb-2">📅 Uploaded: {video.uploadedAt}</div>
          <div className="mb-2">⏱ Duration: {video.duration}</div>
          <div className="mb-2">👀 Views: {video.views}</div>
          <div className="mb-2">👍 Likes: {video.likes}</div>
          <div className="mb-2">💾 Estimated Size: MP3 ~ {video.mp3Size}, MP4 ~ {video.mp4Size}</div>

          <div className="flex flex-wrap gap-4 mt-4">
            <button onClick={() => downloadFile("mp3")} className="bg-green-600 px-4 py-2 rounded hover:bg-green-800">
              ⬇️ Download MP3
            </button>
            <button onClick={() => downloadFile("mp4")} className="bg-red-600 px-4 py-2 rounded hover:bg-red-800">
              ⬇️ Download MP4
            </button>
          </div>

          {progress !== null && (
            <div className="w-full bg-gray-700 rounded-full mt-4">
              <div
                className="bg-green-400 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
              <p className="text-sm mt-1">Download Progress: {progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

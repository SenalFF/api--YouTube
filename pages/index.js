import { useEffect, useState } from "react";
import ytSearch from "yt-search";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const searchYouTube = async () => {
    if (!query.trim()) return setError("Please enter a search term or link.");
    setError("");
    setVideo(null);
    setDownloading(false);
    setDownloadProgress(0);

    try {
      const res = await ytSearch(query);
      if (!res.videos.length) return setError("No results found.");
      setVideo(res.videos[0]);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    }
  };

  const handleDownload = async (type) => {
    if (!video || !video.videoId) return;

    setDownloading(true);
    setDownloadProgress(0);

    // We'll simulate progress bar here because direct download progress from new tab is not accessible.
    // In real implementation, server API can send progress updates via websocket or SSE.

    const url = `/api/download/${type}?id=${video.videoId}`;

    // Open download in new tab
    window.open(url, "_blank");

    // Fake progress increment
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const estimateFileSize = (durationSec, isAudio) => {
    // kbps: audio ~128 kbps, video ~800 kbps
    const kbps = isAudio ? 128 : 800;
    const bytes = (durationSec * kbps * 1000) / 8;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Handle Enter key to auto search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchYouTube();
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#f0f0f0",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center" }}>YouTube Downloader</h1>

      <button
        onClick={toggleTheme}
        style={{
          display: "block",
          margin: "1rem auto",
          padding: "6px 12px",
          borderRadius: "5px",
          backgroundColor: darkMode ? "#ffffff" : "#000000",
          color: darkMode ? "#000000" : "#ffffff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>

      <input
        type="text"
        placeholder="Search or paste YouTube link"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        style={{
          padding: "10px",
          width: "100%",
          fontSize: "16px",
          marginBottom: "10px",
          backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
          color: darkMode ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: 5,
        }}
      />

      <button
        onClick={searchYouTube}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        Search
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {error}
        </p>
      )}

      {video && (
        <div
          style={{
            marginTop: "2rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: darkMode
              ? "0 0 10px #222"
              : "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 10 }}>
            {video.title}
          </h2>

          <iframe
            width="100%"
            height="360"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            frameBorder="0"
            allowFullScreen
            style={{ borderRadius: "10px", marginBottom: "10px" }}
          ></iframe>

          <p>
            <strong>Duration:</strong> {video.timestamp}
          </p>
          <p>
            <strong>Views:</strong> {video.views.toLocaleString()}
          </p>
          <p>
            <strong>Likes / Uploaded:</strong> {video.ago}
          </p>
          <p>
            <strong>Estimated MP3 Size:</strong>{" "}
            {estimateFileSize(video.seconds, true)}
          </p>
          <p>
            <strong>Estimated MP4 Size:</strong>{" "}
            {estimateFileSize(video.seconds, false)}
          </p>

          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button
              onClick={() => handleDownload("mp3")}
              disabled={downloading}
              style={{
                padding: "10px 15px",
                marginRight: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: downloading ? "not-allowed" : "pointer",
              }}
            >
              Download MP3
            </button>
            <button
              onClick={() => handleDownload("mp4")}
              disabled={downloading}
              style={{
                padding: "10px 15px",
                backgroundColor: "#ffc107",
                color: "#000",
                border: "none",
                borderRadius: "5px",
                cursor: downloading ? "not-allowed" : "pointer",
              }}
            >
              Download MP4
            </button>
          </div>

          {downloading && (
            <div style={{ marginTop: 20 }}>
              <progress
                value={downloadProgress}
                max="100"
                style={{ width: "100%" }}
              />
              <p style={{ textAlign: "center" }}>{downloadProgress}%</p>
            </div>
          )}
        </div>
      )}

      <footer
        style={{
          marginTop: 40,
          fontSize: 12,
          color: darkMode ? "#aaa" : "#555",
          textAlign: "center",
        }}
      >
        © 2025 Mr Senal's YouTube Downloader
      </footer>
    </div>
  );
}

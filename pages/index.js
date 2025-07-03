import { useEffect, useState } from "react";
import axios from "axios";
import ytSearch from "yt-search";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const searchYouTube = async () => {
    setError("");
    setVideo(null);
    try {
      const res = await ytSearch(query);
      if (!res.videos.length) return setError("No results found");
      setVideo(res.videos[0]);
    } catch (err) {
      console.error(err);
      setError("Search failed");
    }
  };

  const handleDownload = async (type) => {
    if (!video || !video.videoId) return;
    setIsDownloading(true);
    setProgress(0);

    // Open download
    const downloadWindow = window.open(`/api/download/${type}?id=${video.videoId}`, "_blank");

    // Subscribe to download progress via SSE
    const eventSource = new EventSource(`/api/progress?id=${video.videoId}`);
    eventSource.onmessage = (e) => {
      const p = parseFloat(e.data);
      setProgress(p);
      if (p >= 100) {
        eventSource.close();
        setTimeout(() => setIsDownloading(false), 1000);
      }
    };

    eventSource.onerror = () => {
      console.warn("Progress stream error.");
      eventSource.close();
      setIsDownloading(false);
    };
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const estimateFileSize = (durationSec, isAudio) => {
    const kbps = isAudio ? 128 : 800;
    const bytes = (durationSec * kbps * 1000) / 8;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

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
      }}
    >
      <h1>YouTube Downloader</h1>

      <button
        onClick={toggleTheme}
        style={{
          marginBottom: "1rem",
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
          width: "80%",
          fontSize: "16px",
          marginBottom: "10px",
          backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
          color: darkMode ? "#fff" : "#000",
          border: "1px solid #ccc",
        }}
      />
      <br />
      <button
        onClick={searchYouTube}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Search
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {video && (
        <div style={{ marginTop: "2rem", maxWidth: "640px" }}>
          <h2>{video.title}</h2>

          <iframe
            width="100%"
            height="360"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            frameBorder="0"
            allowFullScreen
            style={{ borderRadius: "10px", marginBottom: "10px" }}
          ></iframe>

          <p><strong>Duration:</strong> {video.timestamp}</p>
          <p><strong>Views:</strong> {video.views.toLocaleString()}</p>
          <p><strong>Uploaded:</strong> {video.ago}</p>
          <p><strong>MP3 Size:</strong> {estimateFileSize(video.seconds, true)}</p>
          <p><strong>MP4 Size:</strong> {estimateFileSize(video.seconds, false)}</p>

          {isDownloading && (
            <div style={{ marginTop: "15px" }}>
              <div style={{ width: "100%", backgroundColor: "#ccc", height: "10px", borderRadius: "5px" }}>
                <div
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "#007bff",
                    height: "10px",
                    borderRadius: "5px",
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <p style={{ fontSize: "14px" }}>{progress.toFixed(0)}%</p>
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => handleDownload("mp3")}
              style={{
                padding: "10px 15px",
                marginRight: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Download MP3
            </button>
            <button
              onClick={() => handleDownload("mp4")}
              style={{
                padding: "10px 15px",
                backgroundColor: "#ffc107",
                color: "#000",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Download MP4
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

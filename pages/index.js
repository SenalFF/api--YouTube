import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const searchYouTube = async () => {
    setError("");
    setVideo(null);
    if (!query.trim()) return;
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      setVideo(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed");
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const estimateFileSize = (durationSec, isAudio) => {
    const kbps = isAudio ? 128 : 800; // kbps
    const bytes = (durationSec * kbps * 1000) / 8;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchYouTube();
  };

  const handleDownload = async (type) => {
    if (!video || !video.videoId) return;
    setDownloading(true);
    setDownloadProgress(0);

    try {
      const url = `/api/download?id=${video.videoId}&type=${type}`;
      const response = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(percentCompleted);
          }
        },
      });

      // Create a link to download
      const href = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", `${video.title}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError("Download failed");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#f0f0f0",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        maxWidth: 800,
        margin: "auto",
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
          marginBottom: "1rem",
        }}
      >
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {video && (
        <div style={{ marginTop: "1rem" }}>
          <h2>{video.title}</h2>

          <img
            src={video.image}
            alt={video.title}
            style={{ width: "100%", borderRadius: 10, marginBottom: 10 }}
          />

          <p><strong>Duration:</strong> {video.timestamp}</p>
          <p><strong>Views:</strong> {video.views.toLocaleString()}</p>
          <p><strong>Uploaded:</strong> {video.ago}</p>
          <p><strong>Author:</strong> {video.author}</p>
          <p><strong>MP3 Size:</strong> {estimateFileSize(video.seconds, true)}</p>
          <p><strong>MP4 Size:</strong> {estimateFileSize(video.seconds, false)}</p>

          <div style={{ marginTop: "10px" }}>
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

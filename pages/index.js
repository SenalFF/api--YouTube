import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      setVideo(res.data.video);
    } catch (err) {
      setVideo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>YouTube Downloader</h1>
      <input
        type="text"
        placeholder="Enter video name or link"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button onClick={handleSearch} style={{ padding: "0.5rem", marginLeft: "1rem" }}>
        Search
      </button>

      {loading && <p>Searching...</p>}

      {video && (
        <div style={{ marginTop: "2rem" }}>
          <h2>{video.title}</h2>
          <img src={video.thumbnail.url} alt={video.title} width="320" />
          <div style={{ marginTop: "1rem" }}>
            <a href={`/api/download/mp3?id=${video.videoId}`} download>
              <button style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}>Download MP3</button>
            </a>
            <a href={`/api/download/mp4?id=${video.videoId}`} download>
              <button style={{ padding: "0.5rem 1rem" }}>Download MP4</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
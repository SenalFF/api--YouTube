import ytSearch from "yt-search";

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const result = await ytSearch(q);
    const video = result.videos[0];
    if (!video) return res.status(404).json({ error: "No video found" });

    const durationSec = video.seconds || 0;
    const mp3Size = ((durationSec * 128 * 1000) / 8 / 1024 / 1024).toFixed(2);
    const mp4Size = ((durationSec * 800 * 1000) / 8 / 1024 / 1024).toFixed(2);

    res.json({
      title: video.title,
      url: video.url,
      videoId: video.videoId,
      uploadedAt: video.ago,
      views: video.views.toLocaleString(),
      likes: video.likes?.toLocaleString() || "N/A",
      duration: video.timestamp,
      mp3Size: `${mp3Size} MB`,
      mp4Size: `${mp4Size} MB`,
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
}

import ruhend from "ruhend-scraper";

export default async function handler(req, res) {
  const { url, type } = req.query;

  if (!url || !type) {
    return res.status(400).json({ error: "Missing url or type" });
  }

  try {
    const result = await ruhend.youtube(url);

    if (!result || !result.title) {
      return res.status(500).json({ error: "Failed to fetch video details" });
    }

    const download = type === "mp3" ? result.mp3 : result.mp4;

    if (!download || !download.url) {
      return res.status(500).json({ error: "Download link not found" });
    }

    return res.status(200).json({
      title: result.title,
      downloadUrl: download.url,
      type,
    });
  } catch (err) {
    console.error("Ruhend error:", err.message);
    return res.status(500).json({ error: "Failed to get download URL" });
  }
}

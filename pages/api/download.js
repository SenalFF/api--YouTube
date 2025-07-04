import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { url, type } = req.query;

  if (!url || !type) {
    return res.status(400).json({ error: "Missing url or type" });
  }

  try {
    const info = await ytdl.getInfo(url);

    // Filter for available formats
    const formats = ytdl.filterFormats(
      info.formats,
      type === "mp3" ? "audioonly" : "videoandaudio"
    );

    // Try to get best quality format with valid URL
    const format = formats.find(f => f && f.url);

    if (!format) {
      console.error("❌ No valid downloadable format found");
      return res.status(500).json({ error: "No downloadable format found" });
    }

    // Clean title
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "").substring(0, 50);

    // Return direct YouTube stream URL
    return res.status(200).json({
      downloadUrl: format.url,
      title,
      type,
    });
  } catch (err) {
    console.error("🔥 Download error:", err.message || err);
    return res.status(500).json({ error: "Failed to get download URL" });
  }
}

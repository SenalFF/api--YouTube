import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { url, type } = req.query;

  if (!url || !type) {
    return res.status(400).json({ error: "Missing url or type" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    const format = ytdl.chooseFormat(info.formats, {
      quality: type === "mp3" ? "highestaudio" : "highestvideo",
      filter: type === "mp3" ? "audioonly" : "audioandvideo",
    });

    if (!format || !format.url) {
      return res.status(500).json({ error: "No downloadable format found." });
    }

    res.status(200).json({
      downloadUrl: format.url,
      title,
      type,
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to get download URL" });
  }
}

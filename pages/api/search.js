import ytdl from "ytdl-core";
import ytSearch from "yt-search";
import normalizeLink from "../../utils/normalizeLink";

export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing search query" });

  const normalized = normalizeLink(query);

  if (normalized.length === 11) {
    const info = await ytdl.getInfo(normalized);
    return res.json({ video: info.videoDetails });
  }

  const result = await ytSearch(normalized);
  const video = result.videos.length ? result.videos[0] : null;

  if (!video) return res.status(404).json({ error: "No video found" });

  return res.json({ video });
}
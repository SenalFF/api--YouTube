import ytSearch from "yt-search";

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const result = await ytSearch(q);
    if (!result.videos.length) return res.status(404).json({ error: "No results found" });
    const video = result.videos[0];

    // Return only required fields
    res.status(200).json({
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      timestamp: video.timestamp,
      seconds: video.seconds,
      views: video.views,
      ago: video.ago,
      author: video.author.name,
      image: video.image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
      }

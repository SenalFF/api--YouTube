import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing video ID");

  const url = `https://www.youtube.com/watch?v=${id}`;
  res.setHeader("Content-Disposition", `attachment; filename="${id}.mp3"`);

  ytdl(url, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
}
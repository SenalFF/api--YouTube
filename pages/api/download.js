import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { id, type } = req.query;
  if (!id || !type) {
    return res.status(400).json({ error: "Missing video ID or type" });
  }

  try {
    const info = await ytdl.getInfo(id);

    res.setHeader("Content-Disposition", `attachment; filename="${info.videoDetails.title}.${type}"`);
    res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

    let format;
    if (type === "mp3") {
      // audio only
      format = ytdl.filterFormats(info.formats, 'audioonly')[0];
    } else {
      // video + audio (choose best mp4)
      format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
      if (!format) {
        // fallback to best video + audio separate streams (complex, omitted here)
        return res.status(400).json({ error: "No suitable format found for mp4" });
      }
    }

    ytdl(id, { format })
      .pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Download failed" });
  }
    }

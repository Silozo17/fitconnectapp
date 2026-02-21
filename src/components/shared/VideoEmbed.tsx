import { useMemo } from "react";

interface VideoEmbedProps {
  url: string;
  className?: string;
  title?: string;
}

type EmbedInfo = {
  type: "youtube" | "vimeo" | "loom" | "wistia" | "direct" | "unknown";
  embedUrl: string;
};

const parseVideoUrl = (url: string): EmbedInfo => {
  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId: string | null = null;
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.includes("/embed/")) {
        videoId = u.pathname.split("/embed/")[1]?.split(/[?/]/)[0];
      } else {
        videoId = u.searchParams.get("v");
      }
      if (videoId) {
        return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${videoId}` };
      }
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) {
        return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
      }
    }

    // Loom
    if (u.hostname.includes("loom.com")) {
      const match = u.pathname.match(/\/(?:share|embed)\/([a-f0-9]+)/);
      if (match) {
        return { type: "loom", embedUrl: `https://www.loom.com/embed/${match[1]}` };
      }
    }

    // Wistia
    if (u.hostname.includes("wistia.com") || u.hostname.includes("wi.st")) {
      const match = u.pathname.match(/\/medias\/([a-zA-Z0-9]+)/);
      if (match) {
        return { type: "wistia", embedUrl: `https://fast.wistia.net/embed/iframe/${match[1]}` };
      }
    }

    // Direct video file
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u.pathname)) {
      return { type: "direct", embedUrl: url };
    }

    return { type: "unknown", embedUrl: url };
  } catch {
    return { type: "unknown", embedUrl: url };
  }
};

const ALLOWED_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "player.vimeo.com",
  "www.loom.com",
  "fast.wistia.net",
];

export const VideoEmbed = ({ url, className = "", title = "Embedded video" }: VideoEmbedProps) => {
  const embed = useMemo(() => parseVideoUrl(url), [url]);

  if (embed.type === "direct") {
    return (
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-muted ${className}`}>
        <video
          src={embed.embedUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
        />
      </div>
    );
  }

  if (embed.type === "unknown") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline break-all"
      >
        {url}
      </a>
    );
  }

  // Validate embed URL host
  try {
    const u = new URL(embed.embedUrl);
    if (!ALLOWED_HOSTS.includes(u.hostname)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">
          {url}
        </a>
      );
    }
  } catch {
    return null;
  }

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-muted ${className}`}>
      <iframe
        src={embed.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      />
    </div>
  );
};

export { parseVideoUrl };

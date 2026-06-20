"use client";

import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function VideoPlayer({ url, thumbnail, onProgress }) {
  return (
    <div className="video-player-wrapper">
      <div style={{ aspectRatio: "16/9" }}>
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          light={thumbnail || false}
          playing={!!thumbnail}
          onProgress={onProgress}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
          style={{ borderRadius: "12px", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}

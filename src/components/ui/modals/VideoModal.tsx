'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
};

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = 'Video Walkthrough'
}: VideoModalProps) {
  // Process video URL based on platform (Loom, Tella, etc.)
  const getEmbedUrl = (url: string) => {
    // Handle Tella video URLs
    if (url.includes('tella.tv/video/')) {
      // If it's already an embed URL, return as is
      if (url.includes('/embed')) {
        return url;
      }
      // Convert regular Tella URL to embed URL
      const videoId = url.split('tella.tv/video/')[1].split('?')[0];
      return `https://www.tella.tv/video/${videoId}/embed`;
    }

    // Handle Loom video URLs
    if (url.includes('loom.com/share/')) {
      const videoId = url.split('loom.com/share/')[1].split('?')[0];
      return `https://www.loom.com/embed/${videoId}`;
    }

    // If it's already an embed URL, return as is
    if (url.includes('loom.com/embed/') || url.includes('tella.tv/video/') && url.includes('/embed')) {
      return url;
    }

    // Default fallback
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
    >
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          className="w-full h-full rounded-md"
          title={title}
          allow="autoplay; fullscreen"
        ></iframe>
      </div>
    </EnhancedModal>
  );
}

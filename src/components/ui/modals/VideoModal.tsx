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
  // Extract Loom video ID from URL if it's a Loom video
  const getLoomEmbedUrl = (url: string) => {
    // Handle different Loom URL formats
    if (url.includes('loom.com/share/')) {
      const videoId = url.split('loom.com/share/')[1].split('?')[0];
      return `https://www.loom.com/embed/${videoId}`;
    }
    // If it's already an embed URL, return as is
    if (url.includes('loom.com/embed/')) {
      return url;
    }
    // For demo purposes, use a known embeddable Loom video
    return 'https://www.loom.com/embed/3bfa83acc9fd41b7b98b803ba9197d90';
  };

  const embedUrl = getLoomEmbedUrl(videoUrl);

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
        ></iframe>
      </div>
    </EnhancedModal>
  );
}

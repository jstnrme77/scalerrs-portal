'use client';

import { useState } from 'react';

export interface DocumentViewerState {
  isOpen: boolean;
  url: string;
  title: string;
}

export default function useDocumentViewer() {
  const [documentModal, setDocumentModal] = useState<DocumentViewerState>({
    isOpen: false,
    url: '',
    title: ''
  });

  const openDocumentViewer = (url: string, title: string = 'Document Viewer') => {
    setDocumentModal({
      isOpen: true,
      url,
      title
    });
  };

  const closeDocumentViewer = () => {
    setDocumentModal({
      ...documentModal,
      isOpen: false
    });
  };

  return {
    documentModal,
    openDocumentViewer,
    closeDocumentViewer
  };
}

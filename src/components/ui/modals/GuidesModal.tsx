'use client';

import React from 'react';
import { EnhancedModal } from '@/components/ui/modals';
import { FileText, Download } from 'lucide-react';

export type Guide = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
};

type GuidesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  guide: Guide;
};

export default function GuidesModal({
  isOpen,
  onClose,
  title = 'Guide',
  guide
}: GuidesModalProps) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || guide.title}
      size="full"
    >
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FileText className="text-[#9EA8FB] mr-2 get-started-icon" size={20} />
            <h3 className="font-medium">{guide.title}</h3>
          </div>
          <a
            href={guide.fileUrl}
            download
            className="flex items-center text-[#9EA8FB] hover:text-[#7D8AF2] transition-colors"
          >
            <Download size={16} className="mr-1" />
            <span>Download</span>
          </a>
        </div>

        <div className="w-full h-[60vh] border border-[#D9D9D9] rounded-md">
          {/* Check if we're in a development environment */}
          {guide.fileUrl.startsWith('/documents/') ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center max-w-md p-6">
                <FileText size={48} className="mx-auto mb-4 text-[#9EA8FB] get-started-document" />
                <h3 className="text-lg font-medium mb-2">{guide.title}</h3>
                <p className="text-[#4F515E] mb-4">{guide.description}</p>

                {guide.fileType === 'PDF' && (
                  <div className="bg-white p-6 rounded-md border border-[#D9D9D9] mb-4 text-left">
                    <h4 className="font-medium mb-2 text-[#12131C]">Document Preview</h4>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <p className="text-sm text-[#4F515E]">This is a placeholder for the actual PDF content that would be displayed in production.</p>
                  </div>
                )}

                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-block px-4 py-2 bg-[#9EA8FB] text-white rounded-md hover:bg-[#7D8AF2] transition-colors"
                >
                  {guide.fileType === 'PDF' ? 'View Full Document' : 'Download to View'}
                </a>
              </div>
            </div>
          ) : (
            guide.fileType === 'PDF' ? (
              <iframe
                src={`${guide.fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title={guide.title}
                sandbox="allow-same-origin allow-scripts"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-[#4F515E]">Preview not available for {guide.fileType} files</p>
                  <a
                    href={guide.fileUrl}
                    download
                    className="mt-4 inline-block px-4 py-2 bg-[#9EA8FB] text-white rounded-md hover:bg-[#7D8AF2] transition-colors"
                  >
                    Download to View
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </EnhancedModal>
  );
}

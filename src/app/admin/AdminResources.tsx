'use client';

import React, { useState } from 'react';
import { DocumentCard, Document } from '@/components/ui/cards';
import { Button, Input } from '@/components/ui/forms';
import { Badge } from '@/components/ui/badges';
import { Modal } from '@/components/ui/modals';

type ResourceDocument = Document & {
  uploadedBy: string;
  editable: boolean;
};

type AdminResourcesProps = {
  resources: ResourceDocument[];
  onUpload: (newResource: Omit<ResourceDocument, 'id' | 'lastUpdated' | 'uploadedBy' | 'editable'>) => void;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
};

export default function AdminResources({
  resources,
  onUpload,
  onView,
  onDownload
}: AdminResourcesProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    size: '0 KB'
  });

  const handleUpload = () => {
    onUpload(newResource);
    setNewResource({ name: '', type: '', size: '0 KB' });
    setIsUploadModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium text-dark">Resources</h2>
          <p className="text-sm text-mediumGray">Shared files that support content production, tone, branding, and collaboration</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(resource => (
          <DocumentCard
            key={resource.id}
            document={resource}
            onView={onView}
            onDownload={onDownload}
          >
            <div className="flex justify-between items-center mt-2">
              <Badge variant="light" className={`text-xs ${resource.editable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {resource.editable ? 'Editable' : 'View Only'}
              </Badge>
              <Badge variant="light" className="text-xs bg-gray-100 text-gray-600">
                Uploaded by {resource.uploadedBy}
              </Badge>
            </div>
          </DocumentCard>
        ))}
      </div>

      {/* Upload Resource Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Resource"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-mediumGray mb-1">Resource Name</label>
            <Input
              id="name"
              value={newResource.name}
              onChange={(e) => setNewResource({...newResource, name: e.target.value})}
              placeholder="e.g., Brand Guidelines, Tone of Voice Guide"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-mediumGray mb-1">File Type</label>
            <select
              id="type"
              value={newResource.type}
              onChange={(e) => setNewResource({...newResource, type: e.target.value})}
              className="block w-full px-3 py-2 border border-lightGray rounded-scalerrs shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">Select file type</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="XLSX">XLSX</option>
              <option value="PPTX">PPTX</option>
              <option value="JPG">JPG</option>
              <option value="PNG">PNG</option>
              <option value="ZIP">ZIP</option>
              <option value="MP4">MP4</option>
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-mediumGray mb-1">Upload File</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-lightGray border-dashed rounded-scalerrs">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-mediumGray" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-mediumGray">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-mediumGray">
                  PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!newResource.name || !newResource.type}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
// import { DocumentCard, Document } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, FileImage, FileArchive, FileVideo, FileSpreadsheet, Link, File } from 'lucide-react';

// Define Document type locally to avoid dependency issues
type Document = {
  id: number;
  name: string;
  type?: string;
  lastUpdated?: string;
  size?: string;
};

type ResourceDocument = Document & {
  uploadedBy?: string;
  editable?: boolean;
};

type AdminResourcesProps = {
  resources: ResourceDocument[];
  onUpload: (newResource: Omit<ResourceDocument, 'id'>) => void;
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

  // Group resources by category for better organization
  const resourceCategories = {
    brandAssets: resources.filter(r => 
      r.name?.toLowerCase().includes('brand') || 
      r.name?.toLowerCase().includes('logo') || 
      r.name?.toLowerCase().includes('assets')
    ),
    contentGuides: resources.filter(r => 
      r.name?.toLowerCase().includes('tone') || 
      r.name?.toLowerCase().includes('guide') || 
      r.name?.toLowerCase().includes('example')
    ),
    productMaterials: resources.filter(r => 
      r.name?.toLowerCase().includes('product') || 
      r.name?.toLowerCase().includes('screenshot')
    ),
    other: resources.filter(r => 
      r.name && !r.name.toLowerCase().includes('brand') && 
      !r.name.toLowerCase().includes('logo') && 
      !r.name.toLowerCase().includes('assets') &&
      !r.name.toLowerCase().includes('tone') && 
      !r.name.toLowerCase().includes('guide') && 
      !r.name.toLowerCase().includes('example') &&
      !r.name.toLowerCase().includes('product') && 
      !r.name.toLowerCase().includes('screenshot')
    )
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium text-dark">Resources</h2>
          <p className="text-sm text-mediumGray">Shared files that support content production, tone, branding, and collaboration</p>
        </div>
        <Button
          variant="default"
          onClick={() => setIsUploadModalOpen(true)}
          className="font-bold rounded-[16px] text-sm bg-[#0F111A]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Brand Assets */}
      {resourceCategories.brandAssets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-dark mb-3">Brand Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCategories.brandAssets.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onView={onView} 
                onDownload={onDownload} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Guides */}
      {resourceCategories.contentGuides.length > 0 && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-dark mb-3">Content Guides & Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCategories.contentGuides.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onView={onView} 
                onDownload={onDownload} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Product Materials */}
      {resourceCategories.productMaterials.length > 0 && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-dark mb-3">Product Materials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCategories.productMaterials.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onView={onView} 
                onDownload={onDownload} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Resources */}
      {resourceCategories.other.length > 0 && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-dark mb-3">Other Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCategories.other.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onView={onView} 
                onDownload={onDownload} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-mediumGray">Resource Name</label>
              <Input
                id="name"
                value={newResource.name}
                onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                placeholder="e.g., Brand Guidelines, Tone of Voice Guide"
                className="w-full rounded-[8px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-mediumGray">File Type</label>
              <Select
                value={newResource.type}
                onValueChange={(value) => setNewResource({...newResource, type: value})}
              >
                <SelectTrigger className="w-full" id="type">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="XLSX">XLSX</SelectItem>
                  <SelectItem value="PPTX">PPTX</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="ZIP">ZIP</SelectItem>
                  <SelectItem value="MP4">MP4</SelectItem>
                  <SelectItem value="URL">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-mediumGray">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-[8px] p-6 text-center">
                <p className="text-sm text-mediumGray mb-2">Drag and drop your file here, or</p>
                <Button 
                  variant="outline"
                  className="font-medium text-sm bg-white"
                >
                  Browse Files
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const fileSize = (file.size / 1024).toFixed(0) + ' KB';
                      setNewResource({
                        ...newResource,
                        name: file.name.split('.')[0],
                        type: file.name.split('.').pop()?.toUpperCase() || '',
                        size: fileSize
                      });
                    }
                  }}
                />
                <p className="text-xs text-mediumGray mt-2">Max file size: 50MB</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="font-bold rounded-[16px]"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleUpload}
                disabled={!newResource.name || !newResource.type}
                className="font-bold rounded-[16px]"
              >
                Upload
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResourceCard({ 
  resource, 
  onView, 
  onDownload 
}: { 
  resource: ResourceDocument; 
  onView?: (id: number) => void; 
  onDownload?: (id: number) => void; 
}) {
  const getFileIcon = (type: string | undefined) => {
    if (!type) return <File className="h-7 w-7 text-gray-500" />;
    
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-7 w-7 text-red-500" />;
      case 'DOCX':
        return <FileText className="h-7 w-7 text-blue-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="h-7 w-7 text-green-500" />;
      case 'PPTX':
        return <FileText className="h-7 w-7 text-orange-500" />;
      case 'JPG':
      case 'PNG':
        return <FileImage className="h-7 w-7 text-purple-500" />;
      case 'ZIP':
        return <FileArchive className="h-7 w-7 text-yellow-500" />;
      case 'MP4':
        return <FileVideo className="h-7 w-7 text-blue-400" />;
      case 'URL':
        return <Link className="h-7 w-7 text-blue-600" />;
      default:
        return <File className="h-7 w-7 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <span className="mr-3">{getFileIcon(resource.type)}</span>
            <div>
              <h4 className="text-base font-medium text-dark">{resource.name}</h4>
            </div>
          </div>
          <Badge 
            className={`text-xs !rounded-lg ${
              resource.uploadedBy === 'Scalerrs' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {resource.uploadedBy || 'Unknown'}
          </Badge>
        </div>
        <div className="flex space-x-2">
          {onView && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(resource.id)}
              className="text-xs py-1 px-2.5 rounded-[8px] font-medium"
            >
              View
            </Button>
          )}
          {onDownload && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onDownload(resource.id)}
              className="text-xs py-1 px-2.5 rounded-[8px] font-medium text-white"
            >
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useClientData } from '@/context/ClientDataContext';
import DashboardLayout from '@/components/DashboardLayout';
import AdminAgreement from './AdminAgreement';
import AdminResources from './AdminResources';
import AdminAccess from './AdminAccess';
import ChangePasswordModal from './ChangePasswordModal';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerHeader, PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { FileText, KeyRound, FolderArchive } from 'lucide-react';

// Sample admin data
const adminData = {
  agreement: [
    { id: 1, name: 'Signed contract', type: 'PDF', lastUpdated: '2025-01-15', size: '1.2 MB', uploadedBy: 'Scalerrs', editable: false },
  ],
  access: [
    { id: 1, service: 'Google Analytics', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-15', uploadedBy: 'Client', editable: true },
    { id: 2, service: 'Google Search Console', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-16', uploadedBy: 'Client', editable: true },
    { id: 3, service: 'WordPress Admin', username: 'admin', password: '••••••••••', notes: 'Production site', lastUpdated: '2025-01-17', uploadedBy: 'Client', editable: true },
    { id: 4, service: 'Ahrefs', username: 'client_account', password: '••••••••••', notes: '', lastUpdated: '2025-01-18', uploadedBy: 'Scalerrs', editable: true },
    { id: 5, service: 'Frase', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-19', uploadedBy: 'Scalerrs', editable: true },
    { id: 6, service: 'YouTube Manager Account Access', username: 'youtube@example.com', password: '••••••••••', notes: 'Brand channel access', lastUpdated: '2025-01-20', uploadedBy: 'Client', editable: true },
  ],
  resources: [
    { id: 1, name: 'Brand guidelines', type: 'PDF', lastUpdated: '2025-03-20', size: '2.4 MB', uploadedBy: 'Client', editable: true },
    { id: 2, name: 'Tone of voice guide', type: 'DOCX', lastUpdated: '2025-02-15', size: '450 KB', uploadedBy: 'Client', editable: true },
    { id: 3, name: 'Example blog post', type: 'PDF', lastUpdated: '2025-03-05', size: '1.8 MB', uploadedBy: 'Scalerrs', editable: true },
    { id: 4, name: 'Product screenshots', type: 'ZIP', lastUpdated: '2025-03-12', size: '680 KB', uploadedBy: 'Client', editable: true },
    { id: 5, name: 'Visual brand assets',  lastUpdated: '2025-01-30',  uploadedBy: 'Client', editable: true },
  ],
  settings: {
    companyName: 'Acme Corp',
    industry: 'Technology',
    website: 'https://www.acmecorp.com',
    primaryContact: 'John Smith',
    contactEmail: 'john.smith@acmecorp.com',
    contactPhone: '(555) 123-4567',
    startDate: '2025-01-01',
    packageType: 'Enterprise SEO',
    renewalDate: '2026-01-01',
    planName: 'Enterprise',
    showUpgradePrompt: true
  },
  missingAccess: true
};

// Simple helper to map resource name to category, adjust as needed
function determineCategory(name: string): string {
  const lc = name.toLowerCase();
  if (lc.includes('brand')) return 'Brand Assets';
  if (lc.includes('guide') || lc.includes('tone') || lc.includes('example')) return 'Content Guides & Examples';
  return 'Product Materials';
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('agreement');
  const [data, setData] = useState(adminData);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, accessId: null as number | null });
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Get currently selected client (set by ClientDataProvider / ClientSelector)
  const { clientId } = useClientData();

  // ------------------------------------------------------------
  // Fetch Airtable data whenever the client changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!clientId) return;

    // ------- Agreements (only the signed contract) -------
    (async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/agreement`);
        const d = await res.json();

        if (d?.url) {
          setData(prev => ({
            ...prev,
            agreement: [
              {
                id: 1,
                name: 'Signed contract',
                type: 'PDF', // Airtable usually stores PDF for contracts
                lastUpdated: new Date().toISOString().split('T')[0],
                size: '',
                uploadedBy: 'Scalerrs',
                editable: false,
                url: d.url, // keep on object for quick access when downloading
              } as any,
            ],
          }));
        }
      } catch (err) {
        console.error('Failed to load agreement', err);
      }
    })();

    // ------- Access & Logins -------
    (async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/access-logins`);
        const records: any[] = await res.json();

        const DEFAULT_SERVICES = [
          'Google Analytics',
          'Google Search Console',
          'WordPress Admin',
          'Ahrefs',
          'Frase',
          'YouTube Manager Account Access',
        ];

        const mapped = DEFAULT_SERVICES.map((service, idx) => {
          const rec = records.find(r => r.name === service);
          return {
            id: rec?.id || idx + 1,
            service,
            username: rec?.username || 'N/A',
            password: '••••••••••', // never expose the real pwd
            notes: rec?.notes || '',
            lastUpdated: rec?.lastModified || 'N/A',
            uploadedBy: rec ? 'Client' : 'Scalerrs',
            editable: true,
          } as any;
        });

        setData(prev => ({
          ...prev,
          access: mapped,
        }));
      } catch (err) {
        console.error('Failed to load access-logins', err);
      }
    })();

    // ------- Resources -------
    (async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/resources`);
        const rs: any[] = await res.json();

        const mapped = rs.map(r => {
          const fileType = r.url ? (r.url.split('.').pop() || '').split('?')[0].toUpperCase() : '';
          return {
            id: r.id,
            name: r.name,
            type: fileType,
            lastUpdated: r.lastModified || '',
            size: '',
            uploadedBy: r.source === 'scalerrs' ? 'Scalerrs' : 'Client',
            editable: true,
            url: r.url,
          } as any;
        });

        setData(prev => ({
          ...prev,
          resources: mapped,
        }));
      } catch (err) {
        console.error('Failed to load resources', err);
      }
    })();
  }, [clientId]);

  const handleChangePassword = (id: number) => {
    const accessItem = data.access.find(item => item.id === id);
    setSelectedAccess(accessItem || null);
    setPasswordModal({ isOpen: true, accessId: id });
  };

  const handleSavePassword = async (id: number, newPassword: string, newUsername: string) => {
    try {
      if (!clientId) throw new Error('Missing clientId');

      if (String(id).startsWith('rec')) {
        await fetch(`/api/clients/${clientId}/access-logins`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password: newPassword, username: newUsername }),
        });
      } else {
        // create new record for this tool
        await fetch(`/api/clients/${clientId}/access-logins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selectedAccess?.service || '',
            username: newUsername,
            password: newPassword,
          }),
        });
      }

      // Update the password in the data
      setData(prevData => ({
        ...prevData,
        access: prevData.access.map(item =>
          item.id === id ? {
            ...item,
            password: '••••••••••',
            lastUpdated: new Date().toISOString().split('T')[0],
            username: newUsername,
          } : item
        )
      }));

      // Show success notification
      setActionStatus({
        type: 'success',
        message: 'Password updated successfully'
      });

      // Clear notification after a delay
      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    } catch (error) {
      // Handle error
      setActionStatus({
        type: 'error',
        message: 'Failed to update password. Please try again.'
      });

      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    }
  };

  const handleAddAccess = async (newAccess: any) => {
    try {
      if (!newAccess.service.trim() || !newAccess.username.trim()) {
        setActionStatus({
          type: 'error',
          message: 'Service name and username are required'
        });
        return;
      }

      if (clientId) {
        await fetch(`/api/clients/${clientId}/access-logins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newAccess.service,
            username: newAccess.username,
            notes: newAccess.notes || '',
          }),
        });
      }

      setData(prevData => ({
        ...prevData,
        access: [...prevData.access, {
          ...newAccess,
          id: Math.max(...prevData.access.map(item => item.id)) + 1,
          password: '••••••••••',
          lastUpdated: new Date().toISOString().split('T')[0],
          uploadedBy: 'Client',
          editable: true
        }]
      }));

      setActionStatus({
        type: 'success',
        message: `Access for ${newAccess.service} added successfully`
      });

      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to add access. Please try again.'
      });

      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    }
  };

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleUploadResource = async (newResource: any) => {
    try {
      if (!newResource.name.trim() || !newResource.type) {
        setActionStatus({
          type: 'error',
          message: 'Resource name and type are required'
        });
        return;
      }

      if (clientId) {
        let attachments: any[] = [];
        if (newResource.file) {
          const dataUrl = await fileToDataURI(newResource.file);
          attachments = [{ url: dataUrl }];
        }

        await fetch(`/api/clients/${clientId}/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newResource.name,
            source: 'client',
            category: determineCategory(newResource.name),
            attachments,
          }),
        });
      }

      setData(prevData => ({
        ...prevData,
        resources: [...prevData.resources, {
          ...newResource,
          id: Math.max(...prevData.resources.map(item => item.id)) + 1,
          lastUpdated: new Date().toISOString().split('T')[0],
          uploadedBy: 'Client',
          editable: true
        }]
      }));

      setActionStatus({
        type: 'success',
        message: `Resource "${newResource.name}" uploaded successfully`
      });

      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to upload resource. Please try again.'
      });

      setTimeout(() => {
        setActionStatus({ type: null, message: null });
      }, 3000);
    }
  };

  return (
    <DashboardLayout>

      {actionStatus.type && actionStatus.message && (
        <div className={`mb-6 p-4 rounded-md ${
          actionStatus.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
          actionStatus.type === 'error' ? 'bg-red-50 border-l-4 border-red-400' :
          'bg-blue-50 border-l-4 border-blue-400'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {actionStatus.type === 'success' && (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {actionStatus.type === 'error' && (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {actionStatus.type === 'info' && (
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                actionStatus.type === 'success' ? 'text-green-700' :
                actionStatus.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {actionStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <PageContainer>
        <PageContainerTabs>
          <div className="tab-navigation">
            <div className="flex justify-between items-center w-full">
              <div className="flex overflow-x-auto">
                <TabNavigation
                  tabs={[
                    { id: 'agreement', label: 'Agreement', icon: <FileText size={16} /> },
                    { id: 'access', label: 'Access & Logins', icon: <KeyRound size={16} /> },
                    { id: 'resources', label: 'Resources', icon: <FolderArchive size={16} /> }
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  variant="primary"
                  containerClassName="flex flex-wrap w-full"
                />
              </div>
            </div>
          </div>
        </PageContainerTabs>

        <PageContainerBody>
          {activeTab === 'agreement' && (
            <AdminAgreement
              agreements={data.agreement}
              settings={data.settings}
              onView={(id) => console.log(`View agreement ${id}`)}
              onDownload={(id) => {
                const doc: any = data.agreement.find(a => a.id === id);
                if (doc?.url) {
                  window.open(doc.url, '_blank');
                }
              }}
            />
          )}

          {activeTab === 'access' && (
            <AdminAccess
              accessItems={data.access}
              onAddAccess={handleAddAccess}
              onChangePassword={handleChangePassword}
              onCopyLogin={(id) => {
                console.log(`Copy login info for ${id}`);
                setActionStatus({
                  type: 'success',
                  message: 'Login information copied to clipboard'
                });
                setTimeout(() => {
                  setActionStatus({ type: null, message: null });
                }, 3000);
              }}
              onGoToService={(id) => console.log(`Go to service ${id}`)}
            />
          )}

          {activeTab === 'resources' && (
            <AdminResources
              resources={data.resources}
              onUpload={handleUploadResource}
              onView={(id) => console.log(`View resource ${id}`)}
              onDownload={(id) => console.log(`Download resource ${id}`)}
            />
          )}
        </PageContainerBody>
      </PageContainer>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={passwordModal.isOpen}
        accessItem={selectedAccess}
        onClose={() => setPasswordModal({ isOpen: false, accessId: null })}
        onSave={handleSavePassword}
      />
    </DashboardLayout>
  );
}
'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminAgreement from './AdminAgreement';
import AdminResources from './AdminResources';
import AdminAccess from './AdminAccess';
import ChangePasswordModal from './ChangePasswordModal';
import TabNavigation, { TabContent } from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerHeader, PageContainerBody } from '@/components/ui/layout/PageContainer';

// Sample admin data
const adminData = {
  agreement: [
    { id: 1, name: 'Signed contract', type: 'PDF', lastUpdated: '2025-01-15', size: '1.2 MB', uploadedBy: 'Scalerrs', editable: false },
    { id: 2, name: 'Client onboarding form', type: 'PDF', lastUpdated: '2025-01-20', size: '850 KB', uploadedBy: 'Scalerrs', editable: false },
  ],
  access: [
    { id: 1, service: 'Google Analytics', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-15', uploadedBy: 'Client', editable: true },
    { id: 2, service: 'Google Search Console', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-16', uploadedBy: 'Client', editable: true },
    { id: 3, service: 'WordPress Admin', username: 'admin', password: '••••••••••', notes: 'Production site', lastUpdated: '2025-01-17', uploadedBy: 'Client', editable: true },
    { id: 4, service: 'Ahrefs', username: 'client_account', password: '••••••••••', notes: '', lastUpdated: '2025-01-18', uploadedBy: 'Scalerrs', editable: true },
    { id: 5, service: 'Frase', username: 'client@example.com', password: '••••••••••', notes: '', lastUpdated: '2025-01-19', uploadedBy: 'Scalerrs', editable: true },
  ],
  resources: [
    { id: 1, name: 'Brand guidelines', type: 'PDF', lastUpdated: '2025-03-20', size: '2.4 MB', uploadedBy: 'Client', editable: true },
    { id: 2, name: 'Tone of voice guide', type: 'DOCX', lastUpdated: '2025-02-15', size: '450 KB', uploadedBy: 'Client', editable: true },
    { id: 3, name: 'Example blog post', type: 'PDF', lastUpdated: '2025-03-05', size: '1.8 MB', uploadedBy: 'Scalerrs', editable: true },
    { id: 4, name: 'Product screenshots', type: 'ZIP', lastUpdated: '2025-03-12', size: '680 KB', uploadedBy: 'Client', editable: true },
    { id: 5, name: 'Visual brand assets', type: 'ZIP', lastUpdated: '2025-01-30', size: '24.5 MB', uploadedBy: 'Client', editable: true },
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState('agreement');
  const [data, setData] = useState(adminData);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, accessId: null as number | null });
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null);

  const handleChangePassword = (id: number) => {
    const accessItem = data.access.find(item => item.id === id);
    setSelectedAccess(accessItem || null);
    setPasswordModal({ isOpen: true, accessId: id });
  };

  const handleSavePassword = (id: number, newPassword: string) => {
    // Update the password in the data
    setData(prevData => ({
      ...prevData,
      access: prevData.access.map(item =>
        item.id === id ? {
          ...item,
          password: '••••••••••',
          lastUpdated: new Date().toISOString().split('T')[0]
        } : item
      )
    }));

    // In a real application, you would send this to an API
    console.log(`Password updated for service ID ${id}`);
  };

  const handleAddAccess = (newAccess: any) => {
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
  };

  const handleUploadResource = (newResource: any) => {
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
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin</h1>
        <p className="text-mediumGray">Manage your campaign settings and resources</p>
      </div>

      {data.missingAccess && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-scalerrs">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                ⚠️ Missing CMS access — please complete setup in the Access & Logins tab.
              </p>
            </div>
          </div>
        </div>
      )}

      <PageContainer>
        <TabNavigation
          tabs={[
            { id: 'agreement', label: 'Agreement' },
            { id: 'access', label: 'Access & Logins' },
            { id: 'resources', label: 'Resources' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="primary"
          containerClassName="overflow-x-auto"
        />

        <PageContainerBody>
          {activeTab === 'agreement' && (
            <AdminAgreement
              agreements={data.agreement}
              settings={data.settings}
              onView={(id) => console.log(`View agreement ${id}`)}
              onDownload={(id) => console.log(`Download agreement ${id}`)}
            />
          )}

          {activeTab === 'access' && (
            <AdminAccess
              accessItems={data.access}
              onAddAccess={handleAddAccess}
              onChangePassword={handleChangePassword}
              onCopyLogin={(id) => console.log(`Copy login info for ${id}`)}
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

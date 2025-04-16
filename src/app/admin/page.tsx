'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminAgreements from './AdminAgreements';
import AdminTeam from './AdminTeam';
import AdminResources from './AdminResources';
import AdminAccess from './AdminAccess';
import AdminOnboarding from './AdminOnboarding';
import EditAccessModal from './EditAccessModal';
import AddTeamMemberModal from './AddTeamMemberModal';
import ChangePasswordModal from './ChangePasswordModal';
import { TeamMember } from '@/components/ui/cards';

// Sample admin data
const adminData = {
  agreements: [
    { id: 1, name: 'Master Services Agreement', type: 'Contract', lastUpdated: '2025-01-15', size: '1.2 MB' },
    { id: 2, name: 'SEO Campaign Scope of Work', type: 'Scope', lastUpdated: '2025-01-20', size: '850 KB' },
    { id: 3, name: 'Campaign Strategy Document', type: 'Strategy', lastUpdated: '2025-01-25', size: '620 KB' },
    { id: 4, name: 'Content Guidelines', type: 'Guidelines', lastUpdated: '2025-01-30', size: '780 KB' },
    { id: 5, name: 'Campaign Kickoff Presentation', type: 'Presentation', lastUpdated: '2025-02-05', size: '1.5 MB' },
  ],
  team: [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@agency.com', role: 'Account Manager', type: 'Agency', phone: '+1 (555) 123-4567', access: 'Admin' },
    { id: 2, name: 'Michael Chen', email: 'michael.c@agency.com', role: 'SEO Specialist', type: 'Agency', phone: '+1 (555) 234-5678', access: 'Admin' },
    { id: 3, name: 'Jessica Williams', email: 'jessica.w@agency.com', role: 'Content Strategist', type: 'Agency', phone: '+1 (555) 345-6789', access: 'Admin' },
    { id: 4, name: 'David Miller', email: 'david.m@agency.com', role: 'Technical SEO', type: 'Agency', phone: '+1 (555) 456-7890', access: 'Admin' },
    { id: 5, name: 'Robert Smith', email: 'robert.s@client.com', role: 'Marketing Director', type: 'Client', phone: '+1 (555) 567-8901', access: 'Viewer' },
    { id: 6, name: 'Emily Davis', email: 'emily.d@client.com', role: 'Content Manager', type: 'Client', phone: '+1 (555) 678-9012', access: 'Viewer' },
  ],
  access: [
    { id: 1, service: 'Google Analytics', username: 'client@example.com', password: '••••••••••' },
    { id: 2, service: 'Google Search Console', username: 'client@example.com', password: '••••••••••' },
    { id: 3, service: 'WordPress Admin', username: 'admin', password: '••••••••••' },
    { id: 4, service: 'Ahrefs', username: 'client_account', password: '••••••••••' },
  ],
  resources: [
    { id: 1, name: 'SEO Best Practices Guide', type: 'PDF', category: 'Education', lastUpdated: '2025-03-20', size: '2.4 MB' },
    { id: 2, name: 'Content Brief Template', type: 'DOCX', category: 'Template', lastUpdated: '2025-02-15', size: '450 KB' },
    { id: 3, name: 'Keyword Research Methodology', type: 'PDF', category: 'Education', lastUpdated: '2025-03-05', size: '1.8 MB' },
    { id: 4, name: 'Technical SEO Audit Checklist', type: 'XLSX', category: 'Template', lastUpdated: '2025-03-12', size: '680 KB' },
    { id: 6, name: 'Scalerrs Onboarding Video', type: 'MP4', category: 'Education', lastUpdated: '2025-01-30', size: '24.5 MB' },
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
    reportFrequency: 'Weekly',
    notificationPreferences: ['Email', 'Portal'],
  },
  onboarding: {
    completed: false,
    lastUpdated: '2025-01-05',
  }
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('agreements');
  const [data, setData] = useState(adminData);
  const [editModal, setEditModal] = useState({ isOpen: false, memberId: null as number | null });
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, accessId: null as number | null });
  const [selectedAccess, setSelectedAccess] = useState<any | null>(null);
  const [onboardingData, setOnboardingData] = useState({
    businessName: '',
    website: '',
    industry: '',
    competitors: '',
    targetAudience: '',
    goals: '',
    existingKeywords: '',
    contentStrategy: '',
    technicalIssues: '',
    analytics: {
      googleAnalytics: false,
      googleSearchConsole: false,
      ahrefs: false,
      semrush: false,
      other: ''
    },
    additionalNotes: ''
  });
  
  const handleEditAccess = (id: number) => {
    setEditModal({ isOpen: true, memberId: id });
    setSelectedMember(data.team.find(member => member.id === id) || null);
  };
  
  const handleSaveAccess = (id: number, access: string) => {
    setData(prev => {
      const newData = { ...prev };
      const memberIndex = newData.team.findIndex(member => member.id === id);
      
      if (memberIndex !== -1) {
        newData.team[memberIndex] = {
          ...newData.team[memberIndex],
          access
        };
      }
      
      return newData;
    });
  };
  
  const handleAddMember = (member: Omit<TeamMember, 'id'> & { id?: number }) => {
    setData(prev => {
      return {
        ...prev,
        team: [...prev.team, member as TeamMember]
      };
    });
    
    setAddMemberModal(false);
  };
  
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
        item.id === id ? { ...item, password: '••••••••••' } : item
      )
    }));
    
    // In a real application, you would send this to an API
    console.log(`Password updated for service ID ${id}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin</h1>
        <p className="text-mediumGray">Manage your campaign settings and resources</p>
      </div>
      
      <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
        <div className="flex border-b border-lightGray overflow-x-auto">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'agreements' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('agreements')}
          >
            Agreements
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'access' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('access')}
          >
            Access & Passwords
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'team' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('team')}
          >
            Team
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'resources' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'onboarding' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveTab('onboarding')}
          >
            Onboarding
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'agreements' && (
            <AdminAgreements 
              agreements={data.agreements}
              onUpload={() => console.log('Upload agreement')}
              onView={(id) => console.log(`View agreement ${id}`)}
              onDownload={(id) => console.log(`Download agreement ${id}`)}
            />
          )}
          
          {activeTab === 'access' && (
            <AdminAccess 
              accessItems={data.access}
              onAddAccess={() => console.log('Add new access')}
              onChangePassword={handleChangePassword}
              onCopyLogin={(id) => console.log(`Copy login info for ${id}`)}
              onGoToService={(id) => console.log(`Go to service ${id}`)}
            />
          )}
          
          {activeTab === 'team' && (
            <AdminTeam 
              team={data.team}
              onAddMember={() => setAddMemberModal(true)}
              onEditAccess={handleEditAccess}
            />
          )}
          
          {activeTab === 'resources' && (
            <AdminResources 
              resources={data.resources}
              onUpload={() => console.log('Upload resource')}
              onView={(id) => console.log(`View resource ${id}`)}
              onDownload={(id) => console.log(`Download resource ${id}`)}
            />
          )}
          
          {activeTab === 'onboarding' && (
            <AdminOnboarding 
              data={onboardingData}
              onChange={setOnboardingData}
              onSaveDraft={() => console.log('Save onboarding as draft')}
              onSubmit={() => console.log('Submit onboarding')}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <EditAccessModal 
        isOpen={editModal.isOpen}
        member={selectedMember}
        onClose={() => setEditModal({ isOpen: false, memberId: null })}
        onSave={handleSaveAccess}
      />

      <AddTeamMemberModal 
        isOpen={addMemberModal}
        onClose={() => setAddMemberModal(false)}
        onAdd={handleAddMember}
      />

      <ChangePasswordModal 
        isOpen={passwordModal.isOpen}
        accessItem={selectedAccess}
        onClose={() => setPasswordModal({ isOpen: false, accessId: null })}
        onSave={handleSavePassword}
      />
    </DashboardLayout>
  );
}

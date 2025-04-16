'use client';

import React from 'react';
import { Input, TextArea, Button } from '@/components/ui/forms';

type OnboardingData = {
  businessName: string;
  website: string;
  industry: string;
  competitors: string;
  targetAudience: string;
  goals: string;
  existingKeywords: string;
  contentStrategy: string;
  technicalIssues: string;
  analytics: {
    googleAnalytics: boolean;
    googleSearchConsole: boolean;
    ahrefs: boolean;
    semrush: boolean;
    other: string;
  };
  additionalNotes: string;
};

type AdminOnboardingProps = {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
};

export default function AdminOnboarding({
  data,
  onChange,
  onSaveDraft,
  onSubmit
}: AdminOnboardingProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit && onSubmit();
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-dark mb-4">Client Onboarding Form</h2>
      <p className="text-mediumGray mb-6">Complete this form to help us better understand your business and SEO goals.</p>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Business Information</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={data.businessName}
                onChange={(e) => onChange({...data, businessName: e.target.value})}
              />
              
              <Input
                label="Website URL"
                value={data.website}
                onChange={(e) => onChange({...data, website: e.target.value})}
              />
              
              <Input
                label="Industry"
                value={data.industry}
                onChange={(e) => onChange({...data, industry: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">SEO Strategy</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <TextArea
                label="Main Competitors (one per line)"
                value={data.competitors}
                onChange={(e) => onChange({...data, competitors: e.target.value})}
                className="h-24"
              />
              
              <TextArea
                label="Target Audience"
                value={data.targetAudience}
                onChange={(e) => onChange({...data, targetAudience: e.target.value})}
                placeholder="Describe your ideal customer profile, demographics, and behaviors"
                className="h-24"
              />
              
              <TextArea
                label="Business Goals"
                value={data.goals}
                onChange={(e) => onChange({...data, goals: e.target.value})}
                placeholder="What are your main business objectives for this SEO campaign?"
                className="h-24"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Current SEO Status</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <TextArea
                label="Existing Keywords (if any)"
                value={data.existingKeywords}
                onChange={(e) => onChange({...data, existingKeywords: e.target.value})}
                placeholder="List any keywords you're currently targeting or ranking for"
                className="h-24"
              />
              
              <TextArea
                label="Content Strategy"
                value={data.contentStrategy}
                onChange={(e) => onChange({...data, contentStrategy: e.target.value})}
                placeholder="Describe your current content creation process and strategy (if any)"
                className="h-24"
              />
              
              <TextArea
                label="Known Technical Issues"
                value={data.technicalIssues}
                onChange={(e) => onChange({...data, technicalIssues: e.target.value})}
                placeholder="List any known technical issues with your website"
                className="h-24"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Analytics Access</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <p className="text-sm text-mediumGray">Select the analytics platforms you currently use:</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="ga" 
                    className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                    checked={data.analytics.googleAnalytics}
                    onChange={(e) => onChange({
                      ...data, 
                      analytics: {
                        ...data.analytics,
                        googleAnalytics: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="ga" className="ml-2 block text-sm text-dark">Google Analytics</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="gsc" 
                    className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                    checked={data.analytics.googleSearchConsole}
                    onChange={(e) => onChange({
                      ...data, 
                      analytics: {
                        ...data.analytics,
                        googleSearchConsole: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="gsc" className="ml-2 block text-sm text-dark">Google Search Console</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="ahrefs" 
                    className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                    checked={data.analytics.ahrefs}
                    onChange={(e) => onChange({
                      ...data, 
                      analytics: {
                        ...data.analytics,
                        ahrefs: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="ahrefs" className="ml-2 block text-sm text-dark">Ahrefs</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="semrush" 
                    className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                    checked={data.analytics.semrush}
                    onChange={(e) => onChange({
                      ...data, 
                      analytics: {
                        ...data.analytics,
                        semrush: e.target.checked
                      }
                    })}
                  />
                  <label htmlFor="semrush" className="ml-2 block text-sm text-dark">SEMrush</label>
                </div>
                
                <Input
                  label="Other Analytics Tools"
                  value={data.analytics.other}
                  onChange={(e) => onChange({
                    ...data, 
                    analytics: {
                      ...data.analytics,
                      other: e.target.value
                    }
                  })}
                  placeholder="List any other analytics tools you use"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Additional Information</h3>
          </div>
          
          <div className="p-4">
            <TextArea
              label="Additional Notes"
              value={data.additionalNotes}
              onChange={(e) => onChange({...data, additionalNotes: e.target.value})}
              placeholder="Any other information that would be helpful for our team"
              className="h-32"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="secondary"
            onClick={onSaveDraft}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            variant="primary"
          >
            Submit Onboarding
          </Button>
        </div>
      </form>
    </div>
  );
}

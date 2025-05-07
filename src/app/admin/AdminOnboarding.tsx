'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
              <div className="space-y-2">
                <label htmlFor="businessName" className="block text-sm font-medium text-mediumGray">Business Name</label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={(e) => onChange({...data, businessName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="website" className="block text-sm font-medium text-mediumGray">Website URL</label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => onChange({...data, website: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="industry" className="block text-sm font-medium text-mediumGray">Industry</label>
                <Input
                  id="industry"
                  value={data.industry}
                  onChange={(e) => onChange({...data, industry: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">SEO Strategy</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="competitors" className="block text-sm font-medium text-mediumGray">Main Competitors (one per line)</label>
                <Textarea
                  id="competitors"
                  value={data.competitors}
                  onChange={(e) => onChange({...data, competitors: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="targetAudience" className="block text-sm font-medium text-mediumGray">Target Audience</label>
                <Textarea
                  id="targetAudience"
                  value={data.targetAudience}
                  onChange={(e) => onChange({...data, targetAudience: e.target.value})}
                  placeholder="Describe your ideal customer profile, demographics, and behaviors"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="goals" className="block text-sm font-medium text-mediumGray">Business Goals</label>
                <Textarea
                  id="goals"
                  value={data.goals}
                  onChange={(e) => onChange({...data, goals: e.target.value})}
                  placeholder="What are your main business objectives for this SEO campaign?"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Current SEO Status</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="existingKeywords" className="block text-sm font-medium text-mediumGray">Existing Keywords (if any)</label>
                <Textarea
                  id="existingKeywords"
                  value={data.existingKeywords}
                  onChange={(e) => onChange({...data, existingKeywords: e.target.value})}
                  placeholder="List any keywords you're currently targeting or ranking for"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contentStrategy" className="block text-sm font-medium text-mediumGray">Content Strategy</label>
                <Textarea
                  id="contentStrategy"
                  value={data.contentStrategy}
                  onChange={(e) => onChange({...data, contentStrategy: e.target.value})}
                  placeholder="Describe your current content creation process and strategy (if any)"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="technicalIssues" className="block text-sm font-medium text-mediumGray">Known Technical Issues</label>
                <Textarea
                  id="technicalIssues"
                  value={data.technicalIssues}
                  onChange={(e) => onChange({...data, technicalIssues: e.target.value})}
                  placeholder="List any known technical issues with your website"
                  className="min-h-[100px]"
                />
              </div>
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
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
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
                  <label 
                    htmlFor="ga" 
                    className="text-sm text-dark font-normal"
                  >
                    Google Analytics
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
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
                  <label 
                    htmlFor="gsc" 
                    className="text-sm text-dark font-normal"
                  >
                    Google Search Console
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
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
                  <label 
                    htmlFor="ahrefs" 
                    className="text-sm text-dark font-normal"
                  >
                    Ahrefs
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
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
                  <label 
                    htmlFor="semrush" 
                    className="text-sm text-dark font-normal"
                  >
                    SEMrush
                  </label>
                </div>
                
                <div className="space-y-2 mt-2">
                  <label htmlFor="otherAnalytics" className="block text-sm font-medium text-mediumGray">Other Analytics Tools</label>
                  <Input
                    id="otherAnalytics"
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
        </div>
        
        <div className="bg-white border border-lightGray rounded-scalerrs overflow-hidden">
          <div className="p-4 border-b border-lightGray bg-gray-50">
            <h3 className="text-md font-medium text-dark">Additional Information</h3>
          </div>
          
          <div className="p-4">
            <div className="space-y-2">
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-mediumGray">Additional Notes</label>
              <Textarea
                id="additionalNotes"
                value={data.additionalNotes}
                onChange={(e) => onChange({...data, additionalNotes: e.target.value})}
                placeholder="Any other information that would be helpful for our team"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          {onSaveDraft && (
            <Button 
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              className="font-bold rounded-[16px]"
            >
              Save Draft
            </Button>
          )}
          
          <Button 
            type="submit"
            variant="default"
            className="font-bold rounded-[16px]"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

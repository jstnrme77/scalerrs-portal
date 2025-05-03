// Mock data for the Get Started page modals

// Checklist items
export const checklistItems = [
  {
    id: '1',
    title: 'Complete Onboarding Form',
    description: 'Fill out the basic information about your business and goals',
    completed: true
  },
  {
    id: '2',
    title: 'Watch Platform Walkthrough',
    description: 'Learn how to navigate and use the Scalerrs portal',
    completed: true
  },
  {
    id: '3',
    title: 'Set Up Analytics Integration',
    description: 'Connect your Google Analytics and Search Console accounts',
    completed: false
  },
  {
    id: '4',
    title: 'Review Campaign Strategy',
    description: 'Go through the proposed strategy and provide feedback',
    completed: false
  },
  {
    id: '5',
    title: 'Approve Initial Keywords',
    description: 'Review and approve the initial keyword targets',
    completed: false
  },
  {
    id: '6',
    title: 'Schedule Kickoff Call',
    description: 'Book a time for the campaign kickoff call with your team',
    completed: false
  }
];

// Roadmap steps
export const roadmapSteps = [
  {
    id: 1,
    title: 'Discovery & Research',
    description: 'We analyze your business, competitors, and target audience to create a tailored strategy.',
    completed: true,
    date: 'Week 1-2'
  },
  {
    id: 2,
    title: 'Technical SEO Audit',
    description: 'We identify and fix technical issues that may be affecting your site\'s performance.',
    completed: true,
    date: 'Week 2-3'
  },
  {
    id: 3,
    title: 'Content Strategy',
    description: 'We develop a comprehensive content plan based on keyword research and audience needs.',
    completed: false,
    date: 'Week 3-4'
  },
  {
    id: 4,
    title: 'Content Production',
    description: 'Our team creates high-quality, optimized content that resonates with your audience.',
    completed: false,
    date: 'Week 4-8'
  },
  {
    id: 5,
    title: 'Link Building',
    description: 'We build high-quality backlinks to boost your site\'s authority and rankings.',
    completed: false,
    date: 'Week 6-12'
  },
  {
    id: 6,
    title: 'Monitoring & Optimization',
    description: 'We continuously track performance and make data-driven adjustments to improve results.',
    completed: false,
    date: 'Ongoing'
  }
];

// Service tabs
export const servicesTabs = [
  {
    id: 'seo',
    title: 'SEO',
    description: 'Our comprehensive SEO service helps improve your website\'s visibility in search engines, driving more organic traffic and leads.',
    features: [
      'Technical SEO Audit & Fixes',
      'Keyword Research & Strategy',
      'On-Page Optimization',
      'Content Creation & Optimization',
      'Link Building',
      'Local SEO (if applicable)',
      'Regular Performance Reporting'
    ],
    progress: 65
  },
  {
    id: 'content',
    title: 'Content Marketing',
    description: 'Our content marketing service creates valuable, relevant content that attracts and engages your target audience, establishing your brand as an industry authority.',
    features: [
      'Content Strategy Development',
      'Blog Posts & Articles',
      'Ebooks & Whitepapers',
      'Infographics & Visual Content',
      'Content Distribution',
      'Content Performance Analysis',
      'Content Calendar Management'
    ],
    progress: 40
  },
  {
    id: 'cro',
    title: 'Conversion Rate Optimization',
    description: 'Our CRO service helps maximize the percentage of website visitors who take desired actions, improving your ROI from existing traffic.',
    features: [
      'User Experience Analysis',
      'A/B Testing',
      'Landing Page Optimization',
      'Funnel Analysis & Optimization',
      'Call-to-Action Optimization',
      'Form Optimization',
      'Checkout Process Optimization (if applicable)'
    ],
    progress: 20
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    description: 'Our analytics service provides clear, actionable insights into your digital marketing performance, helping you make data-driven decisions.',
    features: [
      'Google Analytics Setup & Configuration',
      'Custom Dashboard Creation',
      'Goal & Conversion Tracking',
      'Regular Performance Reports',
      'Traffic Analysis',
      'User Behavior Analysis',
      'ROI Calculation'
    ],
    progress: 80
  }
];

// Guides
export const guides = [
  {
    id: 'content-guidelines',
    title: 'Content Guidelines',
    description: 'Best practices for creating high-quality, SEO-friendly content',
    fileUrl: '/documents/content-guidelines.pdf',
    fileType: 'PDF'
  },
  {
    id: 'link-building',
    title: 'Link Building Guidelines',
    description: 'Strategies and best practices for effective link building',
    fileUrl: '/documents/link-building-guidelines.pdf',
    fileType: 'PDF'
  },
  {
    id: 'technical-seo',
    title: 'Technical SEO Checklist',
    description: 'Comprehensive checklist for technical SEO optimization',
    fileUrl: '/documents/technical-seo-checklist.xlsx',
    fileType: 'XLSX'
  },
  {
    id: 'analytics',
    title: 'Analytics Setup Guide',
    description: 'Step-by-step guide for setting up and using analytics',
    fileUrl: '/documents/analytics-setup-guide.pdf',
    fileType: 'PDF'
  }
];

// Quick access links
export const quickAccessLinks = [
  {
    id: 'slack',
    icon: 'slack',
    label: 'Slack Channel',
    url: 'https://slack.com'
  },
  {
    id: 'drive',
    icon: 'folder',
    label: 'Google Drive',
    url: 'https://drive.google.com'
  },
  {
    id: 'dashboard',
    icon: 'bar-chart',
    label: 'Analytics Dashboard',
    url: '/kpi-dashboard'
  }
];

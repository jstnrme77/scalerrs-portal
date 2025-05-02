# Client Data Mapping to Existing System

## Overview
This document maps the client's provided data structure to our existing Airtable tables and identifies new tables that need to be created.

## Existing Tables in the System
1. Users
2. Tasks
3. Comments
4. Briefs
5. Articles
6. Backlinks
7. KPI Metrics
8. URL Performance
9. Keyword Performance
10. Monthly Projections

## Client Data Tables
1. Growth Model
2. Clusters
3. CVR% Metrics
4. Guide Chapter
5. Target Personas
6. Client Specific Tags
7. Clients
8. Target KPI's

## Mapping

### 1. Growth Model → SEO Growth Models (New/Expanded)
The client's Growth Model table contains detailed SEO growth modeling data that should be stored in a dedicated table. This appears to be similar to the existing SEO Growth Models table in our templates but with more fields.

### 2. Clusters → Content Clusters (Existing/Expanded)
The client's Clusters table maps to our existing Content Clusters table but may need additional fields.

### 3. CVR% Metrics → New Table
This is a new table for tracking conversion rate metrics by different page types and signup types.

### 4. Guide Chapter → New Table
This is a new table for organizing content by chapters or guides.

### 5. Target Personas → New Table
This is a new table for tracking target audience personas.

### 6. Client Specific Tags → New Table
This is a new table for client-specific tagging and categorization.

### 7. Clients → Clients (Existing/Expanded)
The client's Clients table maps to our existing Clients table but may need additional fields.

### 8. Target KPI's → KPI Metrics (Existing/Expanded)
The client's Target KPI's table maps to our existing KPI Metrics table but may need additional fields.

## Field Mapping Details

### Growth Model Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Main Keyword | string | Keywords.Keyword | Keywords |
| Target Page URL | string | URL_Performance.URLPath | Target URL |
| Publication Status | string | URL_Performance.Status | Target URL |
| Page Type (Main) | string | URL_Performance.PageType | Target URL |
| Page Type (Sub) | string | URL_Performance.PageSubType (new) | Target URL |
| Target KW Score | string | Keywords.Score (new) | Keywords |
| All Clients | string | Clients.Name | Clients |
| Base URL | string | URL_Performance.BaseURL (new) | Target URL |
| Country | string | URL_Performance.Country (new) | Target URL |
| Last Updated | date | URL_Performance.LastUpdated (new) | Target URL |
| Update Row | boolean | - | - |
| Update All | boolean | - | - |
| Cluster | string | Clusters.Name | Keywords |
| Primary CTA | string | URL_Performance.PrimaryCTA (new) | Target URL |
| Target Persona | string | Personas.Name | Keywords |
| YouTube Target ? | boolean | URL_Performance.YouTubeTarget (new) | Target URL |
| YouTube Video Status | string | URL_Performance.YouTubeVideoStatus (new) | Target URL |
| Main Keyword Position | number | Keywords.CurrentPosition | Keywords |
| Clicks Last Month | number | URL_Performance.Clicks | Keywords |
| Average Traffic Of Top 3 | number | Keywords.AverageTrafficTop3 (new) | Keywords |
| H1 Tag | string | URL_Performance.H1Tag (new) | Target URL |
| Meta Title | string | URL_Performance.MetaTitle (new) | Target URL |
| Meta Title Length | number | URL_Performance.MetaTitleLength (new) | Target URL |
| Meta Description Length | number | URL_Performance.MetaDescriptionLength (new) | Target URL |
| Current N° Of RDs | number | URL_Performance.CurrentRDs (new) | Target URL |
| Average DR Of Top 3 Positions | number | Keywords.AverageDRTop3 (new) | Target URL |
| Average DR Of Bottom 3 Positions | number | Keywords.AverageDRBottom3 (new) | Target URL |
| Lowest DR In SERP | number | Keywords.LowestDRInSERP (new) | Target URL |
| N° Of RDs Of Lowest DR In SERP | number | Keywords.RDsOfLowestDR (new) | Target URL |
| Position Of Lowest DR In SERP | number | Keywords.PositionOfLowestDR (new) | Target URL |
| Average N° Of RDs Of Lowest 3 DRs | number | Keywords.AvgRDsOfLowest3DRs (new) | Target URL |
| RDs Gap | number | Keywords.RDsGap (new) | Keywords |
| Potential Click Uplift Gap | number | Keywords.PotentialClickUpliftGap (new) | Keywords |
| Sign Up CVR % (Tag) | string | CVR_Metrics.Value | Target URL |
| Sign Up -> Paid Customer % (Tag) | string | CVR_Metrics.Value | Target URL |
| Potential Uplift In Signups | number | URL_Performance.PotentialUpliftInSignups (new) | Target URL |
| New Potential Customers Uplift | number | URL_Performance.NewPotentialCustomersUplift (new) | Target URL |
| RAW Metrics | string | URL_Performance.RAWMetrics (new) | Target URL |
| Link Building Status | string | URL_Performance.LinkBuildingStatus (new) | Target URL |
| Confidence In Uplift ? | number | URL_Performance.ConfidenceInUplift (new) | Target URL |
| Notes | text | URL_Performance.Notes (new) | Target URL |
| Extra Content Assets Needed (Formula) | formula | URL_Performance.ExtraContentAssetsNeeded (new) | Target URL |
| Actual N° RDs Needed | number | Keywords.ActualRDsNeeded (new) | Keywords |
| Starting N° RDs | number | Keywords.StartingRDs (new) | Keywords |
| Starting Keyword Position | number | Keywords.StartingPosition (new) | Keywords |
| N° RDs Built | number | URL_Performance.RDsBuilt (new) | Target URL |
| Secondary Anchor Text | string | URL_Performance.SecondaryAnchorText (new) | Target URL |
| Month (Link Building Targets) | string | Months.Name | Months |
| Adjusted CVR% | number | Keywords.AdjustedCVR (new) | Keywords |
| Specific Tag | string | Keywords.SpecificTag (new) | Keywords |
| Month (Keyword Targets) | string | Months.Name | Months |
| New/Refresh | string | Keywords.NewRefresh (new) | Keywords |
| In Ahrefs Rank Tracker | boolean | Keywords.InAhrefsRankTracker (new) | Keywords |
| CPC ($) | number | Keywords.CPC (new) | Keywords |
| Main Keyword VOL | number | Keywords.Volume | Keywords |
| Main Keyword KD | number | Keywords.Difficulty | Keywords |
| H1 Tag (Old) | string | URL_Performance.H1TagOld (new) | Target URL |
| Meta Title (Old) | string | URL_Performance.MetaTitleOld (new) | Target URL |
| Meta Title Length (Old) | number | URL_Performance.MetaTitleLengthOld (new) | Target URL |
| Meta Description | string | URL_Performance.MetaDescription (new) | Target URL |
| Meta Description (Old) | string | URL_Performance.MetaDescriptionOld (new) | Target URL |
| Meta Description Length (Old) | number | URL_Performance.MetaDescriptionLengthOld (new) | Target URL |
| Old URL | string | URL_Performance.OldURL (new) | Target URL |
| URL Action | string | URL_Performance.URLAction (new) | Target URL |
| URL Status | string | URL_Performance.URLStatus (new) | Target URL |
| Internal Link Remap Status | string | URL_Performance.InternalLinkRemapStatus (new) | Target URL |
| Keyword/Content Status | string | Keywords.ContentStatus (new) | Keywords |
| Guide Chapters | string | Chapters.Name | Keywords |
| Sign Up CVR % (Value) | number | URL_Performance.SignUpCVRValue (new) | Target URL |
| Sign Up -> Paid Customer % (Value) | number | URL_Performance.SignUpToPaidCustomerValue (new) | Target URL |
| Target Cluster Strength | string | URL_Performance.TargetClusterStrength (new) | Target URL |
| Missing N° Pages To Achieve High Strength | number | URL_Performance.MissingPagesForHighStrength (new) | Target URL |
| Collection Page Status (eCom ONLY) | string | URL_Performance.CollectionPageStatus (new) | Target URL |
| Year | string | URL_Performance.Year (new) | Target URL |
| Product Demo Embed (To Keep) | boolean | URL_Performance.ProductDemoEmbedToKeep (new) | Target URL |
| Written Content (G Doc) | string | URL_Performance.WrittenContentGDoc (new) | Target URL |
| Frase Link | string | URL_Performance.FraseLink (new) | Target URL |
| Content Brief Link (G Doc) | string | URL_Performance.ContentBriefLinkGDoc (new) | Target URL |
| Last Modified By | string | URL_Performance.LastModifiedBy (new) | Clients |
| SEO Assignee | string | URL_Performance.SEOAssignee (new) | Clients |
| Content Writer | string | URL_Performance.ContentWriter (new) | Clients |
| Content Editor | string | URL_Performance.ContentEditor (new) | Clients |
| Client Contact #1 | string | URL_Performance.ClientContact1 (new) | Clients |
| Client Contact #2 | string | URL_Performance.ClientContact2 (new) | Clients |
| Added In SEO Gets | boolean | URL_Performance.AddedInSEOGets (new) | Clients |
| Final Word Count | number | URL_Performance.FinalWordCount (new) | Target URL |
| Estimated Word Count | number | URL_Performance.EstimatedWordCount (new) | Target URL |
| Due Date (Publication) | date | URL_Performance.DueDatePublication (new) | Target URL |
| Product Demo Embed Link | string | URL_Performance.ProductDemoEmbedLink (new) | Target URL |
| Month (Product Demo Creation) | string | Months.Name | Months |
| BoFu Exchange Target | boolean | URL_Performance.BoFuExchangeTarget (new) | Target URL |
| Visual #1 | string | URL_Performance.Visual1 (new) | Target URL |
| Visual #2 | string | URL_Performance.Visual2 (new) | Target URL |
| To Redirect To (URL) | string | URL_Performance.ToRedirectToURL (new) | Target URL |

### Clusters Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Name | string | Clusters.Name | Clusters |
| Client | string | Clients.Name | Clients |
| Current Number Of Pages In Cluster | number | Clusters.CurrentNumberOfPages | Clusters |
| Target N° Of Pages For High Strength | number | Clusters.TargetPagesForHighStrength | Clusters |
| Target N° Of Pages For Medium Strength | number | Clusters.TargetPagesForMediumStrength | Clusters |
| Target N° Of Pages For Low Strength | number | Clusters.TargetPagesForLowStrength | Clusters |
| Target Cluster Strength | string | Clusters.TargetClusterStrength | Clusters |
| Missing N° Pages To Achieve High Strength | number | Clusters.MissingPagesForHighStrength | Clusters |
| Growth Model copy | string | Clusters.GrowthModelCopy | Clusters |
| Growth Model | string | Clusters.GrowthModel | Keywords |

### CVR% Metrics Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Name | string | CVR_Metrics.Name | CVR Metrics |
| Clients | string | Clients.Name | Clients |
| Value | number | CVR_Metrics.Value | CVR Metrics |
| Metric Type | string | CVR_Metrics.MetricType | CVR Metrics |
| Signup Type | string | CVR_Metrics.SignupType | CVR Metrics |
| Growth Model | string | CVR_Metrics.GrowthModel | Keywords |

### Guide Chapter Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Client | string | Clients.Name | Chapters |
| Notes | text | Chapters.Notes | Chapters |
| Keywords | string | Keywords.Keyword | Chapters |

### Target Personas Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Notes | text | Persona.Notes | Persona |
| Client | string | Clients.Name | Clients |
| Linked Assets | string | Persona.LinkedAssets | Persona |
| Growth Model | string | Persona.GrowthModel | Keyword |

### Client Specific Tags Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| client | string | Clients.Name | Clients |
| Notes | text | ClientTags.Notes | ClientTags |
| Growth Model | string | ClientTags.GrowthModel | ClientTags |

### Clients Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Name | string | Clients.Name | Clients |
| General Status | string | Clients.GeneralStatus | Clients |
| Contact #1 Name | string | Contacts.Name | Contacts |
| Contact #1 Email | string | Contacts.Email | Contacts |
| Services | string | Clients.Services | Clients |
| Project Portal 🔗 | string | Clients.ProjectPortalLink | Clients |
| Growth Model | string | Clients.GrowthModel | Keywords |
| RAW Metrics | string | Clients.RAWMetrics | Clients |
| Clusters | string | Clusters.Name | Clients |
| CRO/UX Audit | string | Clients.CROUXAudit | Clients |
| Seed Keywords | string | Clients.SeedKeywords | Clients |
| Competitors | string | Competitors.Name | Competitors |
| Growth Model copy | string | Clients.GrowthModelCopy | Clients |
| Target Personas | string | Personas.Name | Personas |
| Trial | boolean | Clients.Trial | Clients |
| Specific Tags | string | ClientTags.Name | Clients |
| Guide Chapter | string | Chapters.Name | Clients |
| WQA Action Points | string | Clients.WQAActionPoints | Clients |
| MoM Projection | string | Months.Name | Months |
| KPIs | string | KPI_Metrics.MetricName | Months |
| Target KPIs copy | string | Clients.TargetKPIsCopy | Clients |
| Target KPIs copy | string | Clients.TargetKPIsCopy | Clients |

### Target KPI's Table
| Client Field | Type | Maps To | Entity |
|-------------|------|---------|--------|
| Name | string | Target_KPIs.Name | Target KPIs |
| KPI Type | string | Target_KPIs.KPIType | Target KPIs |
| KPI Timestamp | date | Target_KPIs.KPITimestamp | Target KPIs |
| Target KPI Value | number | Target_KPIs.TargetKPIValue | Target KPIs |
| KPI Status | string | Target_KPIs.KPIStatus | Target KPIs |
| 1st Owner Of KPI | string | Target_KPIs.FirstOwnerOfKPI | Target KPIs |
| 2nd Owner Of KPI copy | string | Target_KPIs.SecondOwnerOfKPI | Target KPIs |
| Month | string | Months.Name | Months |
| Year | string | Years.Name | Years |
| Quarter | string | Quarters.Name | Quarters |
| Notes | text | Target_KPIs.Notes | Target KPIs |
| Client | string | Clients.Name | Clients |
| Archived | boolean | Target_KPIs.Archived | Target KPIs |
| KPI Value (January) | number | Target_KPIs.KPIValueJanuary | Target KPIs |
| Current KPI Values | number | Target_KPIs.CurrentKPIValues | Target KPIs |

## New Tables Required

1. **CVR_Metrics** - For tracking conversion rate metrics
2. **Chapters** - For organizing content by chapters or guides
3. **Personas** - For tracking target audience personas
4. **ClientTags** - For client-specific tagging
5. **Competitors** - For tracking competitor information
6. **Years** - For year references
7. **Quarters** - For quarter references
8. **Contacts** - For client contact information

## Next Steps

1. Create Airtable CSV templates for the new tables
2. Update existing table templates with new fields
3. Update the application code to handle the new data structure
4. Create or update UI components to display the new data

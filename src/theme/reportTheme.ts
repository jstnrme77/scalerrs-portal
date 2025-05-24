export const reportTheme = {
  /* Brand palette */
  primary   : '#9EA8FB',  // violet
  secondary : '#FCDC94',  // gold
  accent    : '#EADCFF',  // purple tint
  success   : '#22C55E',  // green 600
  infoBg    : '#EFF6FF',  // blue-50
  infoBorder: '#BFDBFE',  // blue-200
  infoText  : '#1E40AF',  // blue-700

  /* KPI strip specific */
  kpiCardBg : '#F5F5F9',
  kpiText   : '#1F2937',  // gray-800
};

/* Hard-coded toggles to include / hide individual KPI cards               */
/* Could later be fetched from Airtable or a settings API                  */
export const metricInclude: Record<string, boolean> = {
  traffic : true,
  leads   : true,
  roiPct  : true,
  cpc     : true,
}; 
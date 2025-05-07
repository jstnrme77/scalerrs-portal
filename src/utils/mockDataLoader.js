import mockData2025 from '../mockups/content-workflow-2025';

/**
 * Utility function to load mockup data for different years
 * @param {string} year - The year to load data for (e.g., '2025')
 * @param {string} month - Optional month filter (e.g., 'January 2025')
 * @param {string} section - Optional section filter ('briefs', 'articles', 'backlinks')
 * @returns {Object} The requested mockup data
 */
export const loadMockData = (year, month = null, section = null) => {
  let data;
  
  // Select the appropriate data based on year
  switch (year) {
    case '2025':
      data = mockData2025;
      break;
    default:
      // Default to 2025 data if no match
      data = mockData2025;
  }
  
  // If a specific section is requested, return only that section
  if (section && data[section]) {
    const sectionData = data[section];
    
    // If a month filter is applied, filter the section data
    if (month) {
      return sectionData.filter(item => item.month === month);
    }
    
    return sectionData;
  }
  
  // If a month filter is applied but no specific section, filter all sections
  if (month) {
    return {
      briefs: data.briefs.filter(item => item.month === month),
      articles: data.articles.filter(item => item.month === month),
      backlinks: data.backlinks.filter(item => item.month === month)
    };
  }
  
  // Return all data if no filters applied
  return data;
};

export default loadMockData;

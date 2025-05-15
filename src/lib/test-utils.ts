/**
 * Test utilities for the refactored Airtable integration
 * This file is for testing purposes only and should not be used in production
 */
import { getAirtableClient, isBrowser, isNetlify, shouldUseMockData } from './airtable-utils';
import { fetchWithFallback, getApiUrl, getCurrentUser, prepareUserHeaders } from './api-utils';
import { formatRelativeDate, getPriorityLevel, truncateString } from './utils';

/**
 * Test the Airtable client initialization
 */
export function testAirtableClient() {
  console.log('Testing Airtable client initialization...');
  const { airtable, base, hasCredentials } = getAirtableClient();
  console.log('Airtable client initialized:', !!airtable);
  console.log('Airtable base initialized:', !!base);
  console.log('Has credentials:', hasCredentials);
  return { airtable, base, hasCredentials };
}

/**
 * Test the environment detection utilities
 */
export function testEnvironmentDetection() {
  console.log('Testing environment detection...');
  console.log('Is browser:', isBrowser);
  console.log('Is Netlify:', isNetlify());
  console.log('Should use mock data:', shouldUseMockData());
  return { isBrowser, isNetlify: isNetlify(), shouldUseMockData: shouldUseMockData() };
}

/**
 * Test the API utilities
 */
export function testApiUtils() {
  console.log('Testing API utilities...');
  console.log('API URL for tasks:', getApiUrl('tasks'));
  console.log('API URL for tasks on Netlify:', getApiUrl('tasks', true));
  console.log('Current user:', getCurrentUser());
  console.log('User headers:', prepareUserHeaders());
  return { 
    apiUrl: getApiUrl('tasks'),
    netlifyApiUrl: getApiUrl('tasks', true),
    currentUser: getCurrentUser(),
    userHeaders: prepareUserHeaders()
  };
}

/**
 * Test the general utilities
 */
export function testGeneralUtils() {
  console.log('Testing general utilities...');
  console.log('Relative date (today):', formatRelativeDate(new Date().toISOString()));
  console.log('Relative date (1 week ago):', formatRelativeDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()));
  console.log('Priority level (high):', getPriorityLevel('High'));
  console.log('Priority level (9):', getPriorityLevel(9));
  console.log('Truncated string:', truncateString('This is a very long string that should be truncated', 20));
  return {
    relativeDate: formatRelativeDate(new Date().toISOString()),
    priorityLevel: getPriorityLevel('High'),
    truncatedString: truncateString('This is a very long string that should be truncated', 20)
  };
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('Running all tests...');
  const airtableClientTest = testAirtableClient();
  const environmentDetectionTest = testEnvironmentDetection();
  const apiUtilsTest = testApiUtils();
  const generalUtilsTest = testGeneralUtils();
  return {
    airtableClientTest,
    environmentDetectionTest,
    apiUtilsTest,
    generalUtilsTest
  };
}

import axios from 'axios';

const DICODING_API_BASE_URL = 'https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api';

const dicodingApi = axios.create({
  baseURL: DICODING_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTutorialContent = async (tutorialId: string): Promise<string> => {
  try {
    console.log('[Dicoding API] Fetching tutorial content for ID:', tutorialId);
    
    const response = await dicodingApi.get('/tutorials/' + tutorialId);
    const htmlContent = response.data?.data?.content;
    
    if (!htmlContent || typeof htmlContent !== 'string') {
      throw new Error('Invalid response format from Dicoding API: missing content field');
    }
    
    console.log('[Dicoding API] Successfully fetched tutorial content');
    return htmlContent;
    
  } catch (error: any) {
    console.error('[Dicoding API] Error fetching tutorial content:', error.message);
    if (error.response) {
      console.error('[Dicoding API] Response status:', error.response.status);
    }
    throw new Error('Failed to fetch tutorial content: ' + error.message);
  }
};

export const getUserPreferences = async (userId: string): Promise<any> => {
  try {
    console.log('[Dicoding API] Fetching user preferences for ID:', userId);
    
    const response = await dicodingApi.get('/users/' + userId + '/preferences');
    const preferences = response.data?.data?.preference;
    
    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid response format from Dicoding API: missing preference field');
    }
    
    console.log('[Dicoding API] Successfully fetched user preferences');
    return preferences;
    
  } catch (error: any) {
    console.error('[Dicoding API] Error fetching user preferences:', error.message);
    if (error.response) {
      console.error('[Dicoding API] Response status:', error.response.status);
    }
    throw new Error('Failed to fetch user preferences: ' + error.message);
  }
};

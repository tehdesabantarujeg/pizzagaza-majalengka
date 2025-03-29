
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../integrations/supabase/types';

const SUPABASE_URL = "https://wbnpwldfcspeoiwofbiq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibnB3bGRmY3NwZW9pd29mYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTYyMDksImV4cCI6MjA1ODczMjIwOX0.yZ-SSI5m-QKgyBPAMLIpkn13MvGN8HszZN-PDusRh1s";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper functions for case conversion
export const camelToSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase);
  }

  const snakeObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === null || obj[key] === undefined) continue;
      
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = camelToSnakeCase(obj[key]);
    }
  }
  return snakeObj;
};

export const snakeToCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase);
  }

  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] === null || obj[key] === undefined) continue;
      
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = snakeToCamelCase(obj[key]);
    }
  }
  return camelObj;
};

export const setupSupabaseTables = async (): Promise<void> => {
  console.log('Setting up Supabase tables if needed');
  return Promise.resolve();
};

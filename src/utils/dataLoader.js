import Papa from 'papaparse';

const CACHE_KEY = 'csv_data_cache';
const CACHE_VERSION = 'v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ENABLE_CACHE = false; // Disable caching for large datasets to prevent localStorage issues

// Helper to get cache from localStorage
const getCachedData = () => {
  if (!ENABLE_CACHE) return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp, version } = JSON.parse(cached);
    
    // Check if cache is valid
    if (version !== CACHE_VERSION) return null;
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    
    return data;
  } catch (error) {
    console.warn('Error reading cache:', error);
    // Clear corrupted cache
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // Ignore
    }
    return null;
  }
};

// Helper to save cache to localStorage
const saveCachedData = (data) => {
  if (!ENABLE_CACHE) return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    
    // Try to save to localStorage (may fail if too large)
    try {
      const serialized = JSON.stringify(cacheData);
      localStorage.setItem(CACHE_KEY, serialized);
    } catch (e) {
      // If localStorage is full or data too large, skip caching
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_FILE_CORRUPTED') {
        console.warn('Data too large for localStorage, skipping cache');
        // Clear any partial cache
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch (e2) {
          // Ignore
        }
      } else {
        console.warn('Error saving cache:', e);
      }
    }
  } catch (error) {
    console.warn('Error saving cache:', error);
  }
};

export const loadCSVData = async () => {
  try {
    // Check cache first (if enabled)
    const cachedData = getCachedData();
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      console.log('Loading data from cache');
      return cachedData;
    }
    
    console.log('Loading data from CSV file');
    const response = await fetch('/Warehouse_and_Retail_Sales.csv');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            // Convert numeric fields
            const data = results.data.map(row => ({
              ...row,
              'RETAIL SALES': parseFloat(row['RETAIL SALES']) || 0,
              'RETAIL TRANSFERS': parseFloat(row['RETAIL TRANSFERS']) || 0,
              'WAREHOUSE SALES': parseFloat(row['WAREHOUSE SALES']) || 0,
              YEAR: parseInt(row['YEAR']) || 0,
              MONTH: parseInt(row['MONTH']) || 0,
            }));
            
            // Save to cache (if enabled and possible)
            saveCachedData(data);
            
            resolve(data);
          } catch (error) {
            reject(new Error(`Error processing CSV data: ${error.message}`));
          }
        },
        error: (error) => {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
};


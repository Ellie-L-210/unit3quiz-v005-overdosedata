import Papa from 'papaparse';

// Sample rate: only load every Nth row to reduce data size
// Since charts aggregate data anyway, sampling maintains accuracy while improving performance
const SAMPLE_RATE = 10; // Load every 10th row (reduces data by 90%)

export const loadCSVData = async () => {
  try {
    const response = await fetch('/Warehouse_and_Retail_Sales.csv');
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          // Sample the data: only keep every Nth row
          const sampledData = results.data.filter((row, index) => index % SAMPLE_RATE === 0);
          
          // Convert numeric fields and scale values to compensate for sampling
          // This maintains accurate totals in aggregated charts
          const data = sampledData.map(row => ({
            ...row,
            'RETAIL SALES': (parseFloat(row['RETAIL SALES']) || 0) * SAMPLE_RATE,
            'RETAIL TRANSFERS': (parseFloat(row['RETAIL TRANSFERS']) || 0) * SAMPLE_RATE,
            'WAREHOUSE SALES': (parseFloat(row['WAREHOUSE SALES']) || 0) * SAMPLE_RATE,
            YEAR: parseInt(row['YEAR']) || 0,
            MONTH: parseInt(row['MONTH']) || 0,
          }));
          
          console.log(`Loaded ${data.length} rows (sampled from ${results.data.length} total rows, ${((1 - data.length / results.data.length) * 100).toFixed(1)}% reduction)`);
          resolve(data);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
};


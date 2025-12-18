import Papa from 'papaparse';

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
          // Convert numeric fields
          const data = results.data.map(row => ({
            ...row,
            'RETAIL SALES': parseFloat(row['RETAIL SALES']) || 0,
            'RETAIL TRANSFERS': parseFloat(row['RETAIL TRANSFERS']) || 0,
            'WAREHOUSE SALES': parseFloat(row['WAREHOUSE SALES']) || 0,
            YEAR: parseInt(row['YEAR']) || 0,
            MONTH: parseInt(row['MONTH']) || 0,
          }));
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


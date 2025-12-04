
export const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const items = JSON.parse(data);
    // Basic date revival for sales and winners history
    if (key.includes('sales') || key.includes('winners')) {
      return items.map((item: any) => {
        const newItem = { ...item };
        if (newItem.date) {
            newItem.date = new Date(newItem.date);
        }
        if (newItem.saleDate) {
            newItem.saleDate = new Date(newItem.saleDate);
        }
        // For winner history which is an array of arrays
        if (Array.isArray(newItem)) {
            return newItem.map(winner => ({...winner, date: new Date(winner.date), saleDate: new Date(winner.saleDate)}));
        }
        return newItem;
      });
    }
    return items;
  } catch (error) {
    console.error(`Error parsing data from localStorage for key "${key}":`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage for key "${key}":`, error);
  }
};

export const addToStorage = <T>(key: string, newData: T | T[]): void => {
  if (typeof window === 'undefined') return;
  const existingData = getFromStorage<T>(key);
  const dataToAdd = Array.isArray(newData) ? newData : [newData];
  saveToStorage(key, [...existingData, ...dataToAdd]);
};

export const clearFromStorage = (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
}

// --- Funções para Objetos ---

export const getObjectFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error parsing object from localStorage for key "${key}":`, error);
    return null;
  }
};

export const saveObjectToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving object to localStorage for key "${key}":`, error);
  }
};

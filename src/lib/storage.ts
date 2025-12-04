
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
        // For winner history which is an array of arrays
        if (Array.isArray(newItem)) {
            return newItem.map(winner => ({...winner, date: new Date(winner.date)}));
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

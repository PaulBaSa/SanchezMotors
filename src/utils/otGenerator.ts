// =============================================
// OT (Orden de Trabajo) ID Generator
// Format: YYMMDD-## (consecutive daily number)
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const OT_COUNTER_KEY = 'ot_counter';

interface OTCounter {
  date: string; // YYMMDD
  count: number;
}

function getDatePrefix(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export async function generateOTId(): Promise<string> {
  const datePrefix = getDatePrefix();

  try {
    const stored = await AsyncStorage.getItem(OT_COUNTER_KEY);
    let counter: OTCounter;

    if (stored) {
      counter = JSON.parse(stored);
      if (counter.date === datePrefix) {
        counter.count += 1;
      } else {
        counter = { date: datePrefix, count: 1 };
      }
    } else {
      counter = { date: datePrefix, count: 1 };
    }

    await AsyncStorage.setItem(OT_COUNTER_KEY, JSON.stringify(counter));

    const sequence = String(counter.count).padStart(2, '0');
    return `${datePrefix}-${sequence}`;
  } catch {
    // Fallback: use timestamp-based ID if storage fails
    const sequence = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    return `${datePrefix}-${sequence}`;
  }
}

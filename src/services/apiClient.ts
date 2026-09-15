export async function sendChatMessage(
  message: string,
  context?: {
    origin?: string;
    destination?: string;
    travelers?: number;
    preference?: string;
    transportOption?: string;
    stayName?: string;
  }
): Promise<string> {
  try {
    const res = await fetch('/api/travel/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'No response received.';
  } catch (error) {
    console.warn('AI Chat API fallback:', error);
    return 'For your journey, we recommend booking reserved train or express bus tickets in advance. Stay hydrated, confirm station departure platforms 30 minutes early, and use authorized prepaid transit.';
  }
}

export async function fetchTripEnrichment(origin: string, destination: string, preference: string) {
  try {
    const res = await fetch('/api/travel/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin, destination, preference }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (e) {
    return {
      transitTip: 'Board early morning departures to bypass congested highway corridors.',
      safetyTip: 'Use official prepaid taxi booths at railway stations or app-based booking.',
      foodTip: 'Explore bustling heritage bazaars for traditional regional dishes.',
    };
  }
}

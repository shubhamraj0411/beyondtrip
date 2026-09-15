import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = express.Router();
apiRouter.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// POST /api/travel/chat - Interactive AI Travel Assistant
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getAIClient();
    if (!ai) {
      // Graceful fallback response when API key isn't provided
      const fallbackReplies: Record<string, string> = {
        train: 'For Indian Railways routes like Delhi-Agra or Delhi-Jaipur, Vande Bharat and Shatabdi Express are the most punctual with reserved air-conditioned CC or EC coaches. Book at least 3-5 days in advance on IRCTC.',
        budget: 'To keep expenses down, consider taking state AC express buses or sleeper trains, book a verified backpacker hostel like Zostel or Moustache, and dine at established local food markets.',
        weather: 'Pack lightweight cotton clothing for warm days, comfortable walking shoes for monuments and bazaars, and keep a light jacket for air-conditioned trains or early mornings.',
      };

      const lower = message.toLowerCase();
      let reply = 'Here is a practical travel recommendation: Compare the departure and arrival station locations to your accommodation to minimize in-city taxi expenses. Train offers the optimal balance of comfort, speed, and affordability on this corridor.';
      for (const [key, val] of Object.entries(fallbackReplies)) {
        if (lower.includes(key)) {
          reply = val;
          break;
        }
      }
      res.json({ reply });
      return;
    }

    const promptContext = context
      ? `The user is planning a trip from "${context.origin}" to "${context.destination}" for ${context.travelers} traveler(s) with priority "${context.preference}". Recommended transport: ${context.transportOption}. Selected stay: ${context.stayName}.`
      : '';

    const systemPrompt = `You are an expert AI Travel Decision Assistant. Your role is to help travelers make smart, economical, safe, and enjoyable travel choices.
${promptContext}
Give concise, objective, highly practical travel advice. Answer specific questions about transportation schedules, station tips, local scams to avoid, packing advice, food recommendations, and budget optimization. Keep responses formatted with clean bullet points when helpful, without filler fluff.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const response = await chat.sendMessage({
      message: message,
    });

    const reply = response.text || 'I could not generate a response at this moment. Please try again.';
    res.json({ reply });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: 'An error occurred while contacting the travel assistant. As a general tip, check your train/bus confirmation and station departure platform on official transit apps before departure.'
    });
  }
});

// POST /api/travel/enrich - Optional AI enrichment for trip notes
apiRouter.post('/enrich', async (req: Request, res: Response) => {
  try {
    const { origin, destination, preference } = req.body;
    const ai = getAIClient();
    if (!ai) {
      res.json({
        insiderTip: 'Book morning transit departures (around 06:00 to 07:30 AM) to beat city traffic and maximize daytime sightseeing.',
        scamWarning: 'Pre-book prepaid taxis or use app-based rides at arrival stations to avoid unmetered touts.',
        foodMustTry: 'Ask locals for century-old food stalls near historic bazaar gates for authentic recipes.',
      });
      return;
    }

    const prompt = `Provide 3 short, high-value insider tips for someone traveling from ${origin} to ${destination} with preference "${preference}":
1. Transit / Departure tip
2. Local safety / avoiding tourist traps
3. Authentic food experience
Format as plain JSON with keys: "transitTip", "safetyTip", "foodTip".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Gemini enrich error:', error);
    res.json({
      transitTip: 'Board early morning trains or buses for smooth travel.',
      safetyTip: 'Use authorized prepaid counters at stations.',
      foodTip: 'Explore popular heritage food bazaars for authentic dining.',
    });
  }
});

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMarketSummary = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a concise, 2-sentence market summary for a fintech dashboard. Mention that tech stocks are rallying due to AI demand and inflation data is positive. Tone should be professional and bullish.",
    });
    return response.text || "Market data unavailable. Tech stocks showing resilience amidst global economic shifts.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market is BULLISH today. Tech stocks are rallying due to positive inflation data.";
  }
};

export const getPortfolioInsight = async (totalValue: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze a portfolio worth $${totalValue} with heavy tech exposure. Give me a one sentence insight about risk/reward.`,
        });
        return response.text || "Portfolio shows strong growth potential but remains sensitive to sector volatility.";
    } catch (error) {
        return "Diversification suggested to mitigate sector-specific risks.";
    }
}

export const analyzeStock = async (symbol: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give a one-sentence technical analysis summary for ${symbol}. Is it a Buy, Hold, or Sell based on recent momentum?`,
        });
        return response.text || `${symbol} shows strong momentum. Analysts suggest a HOLD rating due to recent volatility.`;
    } catch (error) {
        return "Analysis unavailable at this time.";
    }
}
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export type AIModel = 'gemini' | 'gemini-3-flash' | 'gemini-3.1-pro' | 'gemini-3.1-flash-lite' | 'gemini-1.5-flash' | 'gpt-4o' | 'gpt-3.5-turbo' | 'copilot';

function getApiKey() {
  const apiKey = process.env.API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  // If API_KEY is set and doesn't look like a placeholder, use it
  if (apiKey && apiKey !== "undefined" && apiKey !== "" && !apiKey.includes("TODO")) {
    return apiKey;
  }
  
  // Otherwise fallback to GEMINI_API_KEY
  return geminiKey || "";
}

export async function askAIStream(
  prompt: string, 
  onChunk: (chunk: string) => void,
  context?: string, 
  language: 'en' | 'ar' = 'en',
  image?: { data: string; mimeType: string },
  model: AIModel = 'gemini'
) {
  if (!model.startsWith('gemini')) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: `You are ADAM AI. Always provide your response in both English and Arabic. Be concise, accurate, and engaging.` },
            { role: 'user', content: context ? `Context information:\n${context}\n\nQuestion: ${prompt}` : prompt }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to AI service');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              onChunk(data.text);
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }
      return;
    } catch (error: any) {
      console.error("External AI Stream Error:", error);
      onChunk(language === 'ar' 
        ? `عذرًا، واجهت مشكلة: ${error.message}`
        : `I'm sorry, I encountered an error: ${error.message}. Please try again.`);
      return;
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    onChunk(language === 'ar' 
      ? "مفتاح API مفقود. يرجى النقر على زر 'تحديد مفتاح صالح' أدناه أو التحقق من إعدادات التطبيق."
      : "API Key is missing. Please click the 'Select Valid Key' button below or check your app settings.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are ADAM AI. Always provide your response in both English and Arabic. Be concise, accurate, and engaging.`;

  const fullPrompt = context 
    ? `Context information:\n${context}\n\nQuestion: ${prompt}`
    : prompt;

  const parts: any[] = [{ text: fullPrompt }];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  try {
    const modelName = model === 'gemini' || model === 'gemini-3-flash' 
      ? "gemini-3-flash-preview" 
      : model === 'gemini-3.1-pro' 
        ? "gemini-3.1-pro-preview" 
        : model === 'gemini-3.1-flash-lite' 
          ? "gemini-3.1-flash-lite-preview" 
          : model === 'gemini-1.5-flash'
            ? "gemini-1.5-flash"
            : "gemini-3-flash-preview";

    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    
    let fullText = "";
    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    return fullText;
  } catch (error: any) {
    console.error("AI Stream Error:", error);
    const errorMessage = error.message || "Unknown error";
    
    // Fallback for 404/not found errors in streaming
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      try {
        const fallbackResponse = await ai.models.generateContentStream({
          model: "gemini-flash-latest",
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
          }
        });
        
        let fallbackFullText = "";
        for await (const chunk of fallbackResponse) {
          const text = chunk.text;
          if (text) {
            fallbackFullText += text;
            onChunk(text);
          }
        }
        return fallbackFullText;
      } catch (fallbackError) {
        console.error("Fallback AI Stream Error:", fallbackError);
      }
    }

    onChunk(language === 'ar' 
      ? `عذرًا، واجهت مشكلة: ${errorMessage}`
      : `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`);
  }
}

export async function askAI(prompt: string, context?: string, language: 'en' | 'ar' = 'en', model: AIModel = 'gemini') {
  const apiKey = getApiKey();
  if (!apiKey) {
    return language === 'ar' 
      ? "مفتاح API مفقود. يرجى التحقق من الإعدادات."
      : "API Key is missing. Please check your settings.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are ADAM AI. Always provide your response in both English and Arabic. Be concise, accurate, and engaging.`;

  const fullPrompt = context 
    ? `Context information:\n${context}\n\nQuestion: ${prompt}`
    : prompt;

  try {
    const modelName = model === 'gemini' || model === 'gemini-3-flash' 
      ? "gemini-3-flash-preview" 
      : model === 'gemini-3.1-pro' 
        ? "gemini-3.1-pro-preview" 
        : model === 'gemini-3.1-flash-lite' 
          ? "gemini-3.1-flash-lite-preview" 
          : model === 'gemini-1.5-flash'
            ? "gemini-1.5-flash"
            : "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    return text;
  } catch (error: any) {
    console.error("AI Error:", error);
    const errorMessage = error.message || "Unknown error";
    
    // If it's a 404 or model not found, try a fallback model
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
          }
        });
        return fallbackResponse.text || "I'm sorry, I couldn't generate a response.";
      } catch (fallbackError) {
        console.error("Fallback AI Error:", fallbackError);
      }
    }

    return language === 'ar' 
      ? `عذرًا، واجهت مشكلة: ${errorMessage}`
      : `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`;
  }
}

export async function generateImage(prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

export async function generateVideo(prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    // Fetch the video with the API key
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch video');
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    return null;
  }
}

export async function editImage(base64Image: string, mimeType: string, prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Editing Error:", error);
    return null;
  }
}

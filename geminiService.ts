
const API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/ai`;

export class GeminiService {
  static async generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string> {
    const res = await fetch(`${API_BASE}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ prompt, size }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Image generation failed' }));
      throw new Error(err.error || 'Image generation failed');
    }

    const data = await res.json();
    return data.image;
  }

  static async animateImage(imageBase64: string, prompt: string, isPortrait: boolean = false): Promise<string> {
    const res = await fetch(`${API_BASE}/animate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ imageBase64, prompt, isPortrait }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Video generation failed' }));
      throw new Error(err.error || 'Video generation failed');
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  static async getLiveApiKey(): Promise<string> {
    const res = await fetch(`${API_BASE}/live-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to get Live API credentials');
    }

    const data = await res.json();
    return data.apiKey;
  }
}

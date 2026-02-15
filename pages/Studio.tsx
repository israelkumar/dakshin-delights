
import React, { useState, useRef } from 'react';
import { GeminiService } from '../geminiService';
import { useToast } from '../components/Toast';

const Studio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [videoPrompt, setVideoPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleGenerateImage = async () => {
    if (!imagePrompt) {
      showToast('Please describe the dish you want to generate.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const url = await GeminiService.generateImage(imagePrompt, imageSize);
      setGeneratedImage(url);
      showToast('Image generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating image. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!uploadedImage) {
      showToast('Please upload an image first.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const url = await GeminiService.animateImage(uploadedImage, videoPrompt, isPortrait);
      setGeneratedVideo(url);
      showToast('Video animation complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating video. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Dakshin AI Studio</h1>
        <p className="text-stone-500">Create stunning visuals of our cuisine or animate your own food photos using Google Veo.</p>
      </div>

      <div className="flex justify-center mb-8" role="tablist" aria-label="Studio tabs">
        <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex">
          <button
            role="tab"
            aria-selected={activeTab === 'image'}
            onClick={() => setActiveTab('image')}
            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'image' ? 'bg-primary text-white shadow-lg' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Image Generation
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'video'}
            onClick={() => setActiveTab('video')}
            className={`px-8 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'video' ? 'bg-primary text-white shadow-lg' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Video Animation
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-primary/10 rounded-3xl p-8 shadow-xl" role="tabpanel">
        {activeTab === 'image' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label htmlFor="imagePrompt" className="block text-sm font-bold text-stone-600 uppercase">Describe your dish</label>
                <textarea
                  id="imagePrompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full h-32 rounded-xl border-stone-200 dark:border-stone-700 bg-transparent focus:ring-primary focus:border-primary"
                  placeholder="e.g., A gourmet plating of Mysore Masala Dosa with artistic chutney swirls, cinematic lighting, 8k resolution"
                />
                <div className="flex items-center gap-4">
                   <div className="flex-1">
                     <label htmlFor="imageSize" className="block text-xs font-bold text-stone-400 uppercase mb-2">Image Size</label>
                     <select
                      id="imageSize"
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as '1K' | '2K' | '4K')}
                      className="w-full rounded-lg border-stone-200"
                     >
                       <option value="1K">1K (Standard)</option>
                       <option value="2K">2K (High Def)</option>
                       <option value="4K">4K (Ultra HD)</option>
                     </select>
                   </div>
                   <button
                    disabled={isGenerating || !imagePrompt}
                    onClick={handleGenerateImage}
                    className="flex-1 h-full bg-primary text-white font-bold py-3 rounded-lg mt-6 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isGenerating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                     <span>{isGenerating ? 'Generating...' : 'Generate Dish'}</span>
                   </button>
                </div>
              </div>
              <div className="aspect-square bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-stone-300">
                {generatedImage ? (
                  <img src={generatedImage} alt="AI-generated dish" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="material-icons text-6xl text-stone-300" aria-hidden="true">image</span>
                    <p className="text-xs text-stone-400 mt-2">Your generated image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-stone-600 uppercase">Upload a Dish Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                  className="h-48 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label="Click to upload dish photo"
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded dish" className="h-full w-full object-contain p-2" />
                  ) : (
                    <>
                      <span className="material-icons text-4xl text-primary mb-2" aria-hidden="true">cloud_upload</span>
                      <p className="text-sm font-medium">Click to upload image</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" aria-label="Upload dish photo" />
                </div>

                <label htmlFor="videoPrompt" className="block text-sm font-bold text-stone-600 uppercase pt-4">Animation Style (Optional)</label>
                <input
                  id="videoPrompt"
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full rounded-xl border-stone-200"
                  placeholder="e.g., Slow motion steam rising from the dosa"
                />

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPortrait} onChange={() => setIsPortrait(!isPortrait)} className="rounded text-primary" />
                    <span className="text-sm font-medium">Portrait (9:16)</span>
                  </label>
                  <button
                    disabled={isGenerating || !uploadedImage}
                    onClick={handleGenerateVideo}
                    className="flex-1 bg-primary text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>}
                    <span>{isGenerating ? 'Animating...' : 'Animate with Veo'}</span>
                  </button>
                </div>
              </div>

              <div className="aspect-video md:aspect-[16/9] bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-stone-300">
                {generatedVideo ? (
                  <video src={generatedVideo} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="material-icons text-6xl text-stone-300" aria-hidden="true">movie</span>
                    <p className="text-xs text-stone-400 mt-2">Animation can take up to 2 minutes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;

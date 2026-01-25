'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useUser, useClerk, SignIn } from '@clerk/nextjs';
import { ExtractionRequest, ExtractionResponse } from '@/lib/types';

type TabType = 'instagram' | 'text' | 'image';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const [activeTab, setActiveTab] = useState<TabType>('instagram');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExtractionResponse | null>(null);

  // Global paste handler
  useEffect(() => {
    const resizeImageFromFile = async (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxWidth = 1024;
            const maxHeight = 1024;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              resolve(new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              }));
            }, file.type, 0.85);
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Only handle paste when on image tab
      if (activeTab !== 'image') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            try {
              const resizedFile = await resizeImageFromFile(file);
              setImageFile(resizedFile);
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result as string);
              };
              reader.readAsDataURL(resizedFile);
              setError('');
            } catch (err) {
              console.error('Image resize error:', err);
              setError('Failed to process pasted image');
            }
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [activeTab]);

  const resizeImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }, file.type, 0.85); // 85% quality for JPEG compression
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Resize image before setting
      resizeImage(file).then((resizedFile) => {
        setImageFile(resizedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(resizedFile);
        setError('');
      }).catch((err) => {
        console.error('Image resize error:', err);
        setError('Failed to process image');
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      // Check if Clipboard API is supported
      if (!navigator.clipboard || !navigator.clipboard.read) {
        setError('Clipboard access not supported on this device. Please use the file picker instead.');
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        
        if (imageTypes.length > 0) {
          const blob = await clipboardItem.getType(imageTypes[0]);
          const file = new File([blob], 'clipboard-image.png', { type: blob.type });
          
          // Resize the image
          const resizedFile = await resizeImage(file);
          setImageFile(resizedFile);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(resizedFile);
          setError('');
          return;
        }
      }
      
      setError('No image found in clipboard. Please copy an image first.');
    } catch (err: any) {
      console.error('Clipboard paste error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Clipboard access denied. Please grant permission to paste images.');
      } else {
        setError('Failed to paste from clipboard. Try using the file picker instead.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is signed in
    if (!isSignedIn) {
      // Open Clerk sign-in popup
      openSignIn();
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;
      
      if (activeTab === 'image' && imageFile) {
        // Handle image upload
        const formData = new FormData();
        formData.append('image', imageFile);
        
        response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Handle text/URL input
        const payload: ExtractionRequest = {};
        
        if (activeTab === 'instagram') {
          payload.instagramUrl = instagramUrl.trim();
        } else if (activeTab === 'text') {
          payload.text = text.trim();
        }

        response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 md:p-10 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            CalSnap
          </h1>
        </div>
        <p className="text-zinc-400 text-center mb-6 sm:mb-8 text-sm">
          AI-powered event extraction from any source
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 p-1 rounded-xl">
          <button
            className={`flex-1 pb-3 pt-3 px-2 sm:px-4 font-medium text-sm sm:text-base transition-all rounded-lg ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => setActiveTab('instagram')}
          >
            Instagram
          </button>
          <button
            className={`flex-1 pb-3 pt-3 px-2 sm:px-4 font-medium text-sm sm:text-base transition-all rounded-lg ${
              activeTab === 'image'
                ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => setActiveTab('image')}
          >
            Image
          </button>
          <button
            className={`flex-1 pb-3 pt-3 px-2 sm:px-4 font-medium text-sm sm:text-base transition-all rounded-lg ${
              activeTab === 'text'
                ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="min-h-[380px] flex flex-col justify-center">
          {activeTab === 'instagram' && (
            <div className="mb-5">
              <label className="block mb-2 text-zinc-300 font-medium text-sm">
                Instagram URL
              </label>
              <input
                type="url"
                inputMode="url"
                className="w-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-white placeholder-zinc-500 text-base transition-all"
                placeholder="https://www.instagram.com/p/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <p className="text-xs text-zinc-500 mt-2">
                Paste any Instagram post or reel link
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="mb-5">
              <label className="block mb-2 text-zinc-300 font-medium text-sm">
                Event Details
              </label>
              <textarea
                className="w-full p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[120px] sm:min-h-[140px] text-white placeholder-zinc-500 text-base transition-all resize-none"
                placeholder="Team meeting tomorrow at 2pm in Conference Room A"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-zinc-500 mt-2">
                AI will extract date, time, location, and other details
              </p>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="mb-5">
              <label className="block mb-2 text-zinc-300 font-medium text-sm">
                Event Screenshot
              </label>
              <div 
                className="w-full p-6 border-2 border-dashed border-zinc-800 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-zinc-900/30"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <NextImage src={imagePreview} alt="Preview" width={256} height={256} className="max-h-64 mx-auto rounded-lg object-contain border border-zinc-800" unoptimized />
                      <p className="text-sm text-zinc-400">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <svg className="w-12 h-12 mx-auto text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-zinc-400">Click to upload or paste</p>
                      <p className="text-xs text-zinc-600">JPG, PNG, WebP</p>
                    </div>
                  )}
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="flex-1 py-3 px-4 bg-zinc-800 text-zinc-300 font-medium rounded-lg hover:bg-zinc-700 active:scale-95 transition-all text-sm touch-manipulation border border-zinc-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste from Clipboard
                  </span>
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Paste screenshots with Cmd+V / Ctrl+V
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 sm:py-3.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base touch-manipulation"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Extract Event'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 mt-3 font-medium">Analyzing with AI...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.eventInfo && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Event Extracted</h3>
            </div>
            
            <div className="bg-zinc-900/50 p-3 sm:p-4 rounded-lg mb-4 space-y-3 border border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Title</span>
                <p className="text-white font-medium mt-1">{result.eventInfo.title}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Date</span>
                  <p className="text-white font-medium mt-1">
                    {formatDate(result.eventInfo.startDateTime).date}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Time</span>
                  <p className="text-white font-medium mt-1">
                    {formatDate(result.eventInfo.startDateTime).time} - {formatDate(result.eventInfo.endDateTime).time}
                  </p>
                </div>
              </div>
              {result.eventInfo.location && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Location</span>
                  <p className="text-white font-medium mt-1">{result.eventInfo.location}</p>
                </div>
              )}
              {result.eventInfo.description && (
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Description</span>
                  <p className="text-white font-medium mt-1">{result.eventInfo.description}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={(result.eventInfo as any).googleUrl || result.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg active:scale-95 transition-all touch-manipulation border border-zinc-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 3.5h-15a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-13a2 2 0 0 0-2-2zm-15 1.5h15a.5.5 0 0 1 .5.5v2.5h-16v-2.5a.5.5 0 0 1 .5-.5zm15 14h-15a.5.5 0 0 1-.5-.5v-9h16v9a.5.5 0 0 1-.5.5z"/>
                </svg>
                Google
              </a>
              <a
                href={(result.eventInfo as any).outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg active:scale-95 transition-all touch-manipulation border border-zinc-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2L2 5v14l5 3 5-3V5L7 2zm0 16.5L4.5 17V7L7 5.5v13zM21.5 5h-8v3h8v10h-8v3h8c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5z"/>
                </svg>
                Outlook
              </a>
              <a
                href={(result.eventInfo as any).appleUrl}
                download="event.ics"
                className="flex items-center justify-center gap-2 py-3.5 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg active:scale-95 transition-all touch-manipulation border border-zinc-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

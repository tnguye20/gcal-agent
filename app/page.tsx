'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { ExtractionRequest, ExtractionResponse } from '@/lib/types';

type TabType = 'instagram' | 'text' | 'image';

export default function Home() {
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
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
          📅 Instagram to Calendar
        </h1>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm">
          Convert Instagram posts to Google Calendar invites instantly
        </p>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-6 border-b-2 border-gray-200">
          <button
            className={`pb-3 px-2 sm:px-4 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'instagram'
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('instagram')}
          >
            Instagram
            {activeTab === 'instagram' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            className={`pb-3 px-2 sm:px-4 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'text'
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text
            {activeTab === 'text' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            className={`pb-3 px-2 sm:px-4 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'image'
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('image')}
          >
            Image
            {activeTab === 'image' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'instagram' && (
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold text-sm">
                Paste Instagram Post or Reel URL
              </label>
              <input
                type="url"
                inputMode="url"
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none text-gray-800 text-base"
                placeholder="https://www.instagram.com/p/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Example: https://www.instagram.com/p/ABC123xyz/
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold text-sm">
                Enter Event Text
              </label>
              <textarea
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none min-h-[120px] sm:min-h-[140px] text-gray-800 text-base"
                placeholder="Paste event details here... e.g., 'Team meeting tomorrow at 2pm in Conference Room A'"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Include date, time, location, and event details
              </p>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold text-sm">
                Upload or Paste Event Image
              </label>
              <div 
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-600 transition-colors cursor-pointer"
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
                      <NextImage src={imagePreview} alt="Preview" width={256} height={256} className="max-h-64 mx-auto rounded-lg object-contain" unoptimized />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📸</div>
                      <p className="text-gray-600">Click to upload or paste an image</p>
                      <p className="text-xs text-gray-500">Supports JPG, PNG, WebP</p>
                    </div>
                  )}
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="flex-1 py-3 px-4 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 active:scale-95 transition-all text-sm touch-manipulation"
                >
                  📋 Paste from Clipboard
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Copy a screenshot, then tap &ldquo;Paste from Clipboard&rdquo; or use Cmd+V / Ctrl+V on desktop
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 sm:py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base sm:text-base touch-manipulation"
          >
            {loading ? 'Processing with AI...' : 'Convert to Calendar Event'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-600 mt-3 font-medium">Processing with AI...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && result.eventInfo && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gray-50 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">✨ Event Created!</h3>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg mb-4">
              <p className="mb-2">
                <strong className="text-gray-700">📋 Title:</strong>{' '}
                <span className="text-gray-800">{result.eventInfo.title}</span>
              </p>
              <p className="mb-2">
                <strong className="text-gray-700">📅 Date:</strong>{' '}
                <span className="text-gray-800">
                  {formatDate(result.eventInfo.startDateTime).date}
                </span>
              </p>
              <p className="mb-2">
                <strong className="text-gray-700">🕐 Time:</strong>{' '}
                <span className="text-gray-800">
                  {formatDate(result.eventInfo.startDateTime).time} -{' '}
                  {formatDate(result.eventInfo.endDateTime).time}
                </span>
              </p>
              {result.eventInfo.location && (
                <p className="mb-2">
                  <strong className="text-gray-700">📍 Location:</strong>{' '}
                  <span className="text-gray-800">{result.eventInfo.location}</span>
                </p>
              )}
              {result.eventInfo.description && (
                <p>
                  <strong className="text-gray-700">📝 Description:</strong>{' '}
                  <span className="text-gray-800">{result.eventInfo.description}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={(result.eventInfo as any).googleUrl || result.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3.5 sm:py-2.5 bg-blue-500 text-white font-semibold rounded-lg active:scale-95 transition-transform touch-manipulation"
              >
                📅 Add to Google
              </a>
              <a
                href={(result.eventInfo as any).outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3.5 sm:py-2.5 bg-blue-600 text-white font-semibold rounded-lg active:scale-95 transition-transform touch-manipulation"
              >
                📆 Add to Outlook
              </a>
              <a
                href={(result.eventInfo as any).appleUrl}
                download="event.ics"
                className="block text-center py-3.5 sm:py-2.5 bg-gray-700 text-white font-semibold rounded-lg active:scale-95 transition-transform touch-manipulation"
              >
                🍎 Add to Apple
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

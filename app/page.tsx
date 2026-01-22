'use client';

import { useState } from 'react';
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
          setError('');
        }
        break;
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
                onPaste={handlePaste}
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
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
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
              <p className="text-xs text-gray-500 mt-2">
                Paste (Cmd+V / Ctrl+V) or upload an image with event details
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

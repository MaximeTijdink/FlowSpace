import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { AlertCircle } from 'lucide-react';

interface VideoStreamProps {
  roomUrl: string;
  onLeave?: () => void;
}

export default function VideoStream({ roomUrl, onLeave }: VideoStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<DailyIframe.DailyCall | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeCall = async () => {
      if (!containerRef.current || !roomUrl) return;

      try {
        console.log('Initializing Daily.co call...');
        setIsLoading(true);
        setError(null);

        // Clean up existing frame
        if (frameRef.current) {
          await frameRef.current.destroy();
          frameRef.current = null;
        }

        // Create new frame
        const frame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px'
          },
          showLeaveButton: true,
          showFullscreenButton: true,
          showLocalVideo: true,
          showParticipantsBar: true
        });

        frameRef.current = frame;

        // Set up event handlers
        frame
          .on('loading', () => console.log('Frame loading...'))
          .on('loaded', () => console.log('Frame loaded'))
          .on('joining-meeting', () => console.log('Joining meeting...'))
          .on('joined-meeting', () => {
            console.log('Joined meeting');
            if (mounted) setIsLoading(false);
          })
          .on('left-meeting', () => {
            console.log('Left meeting');
            if (mounted && onLeave) onLeave();
          })
          .on('error', (e) => {
            console.error('Daily.co error:', e);
            if (mounted) {
              setError('Failed to connect to video call');
              setIsLoading(false);
            }
          });

        // Join the meeting
        await frame.join({ url: roomUrl });

      } catch (err) {
        console.error('Video call initialization error:', err);
        if (mounted) {
          setError('Failed to initialize video call');
          setIsLoading(false);
        }
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      if (frameRef.current) {
        frameRef.current.destroy().catch(console.error);
      }
    };
  }, [roomUrl, onLeave]);

  if (error) {
    return (
      <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 p-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-center text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <div ref={containerRef} className="absolute inset-0 bg-gray-900 rounded-xl overflow-hidden" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-opacity-80">Connecting to video call...</p>
          </div>
        </div>
      )}
    </div>
  );
}
import axios from 'axios';

// Use environment variable for API key
const DAILY_API_KEY = import.meta.env.VITE_DAILY_API_KEY || '619e4095df4d3a450082fdcae58ef99b60b85403f6eec7bd335c73deaa30a5d8';
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function createRoom(): Promise<string> {
  try {
    console.log('Creating Daily.co room...');
    
    // Generate a unique room name
    const roomName = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await axios.post(`${DAILY_API_URL}/rooms`, {
      name: roomName,
      privacy: 'public',
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: true, // Start with video off to prevent immediate permission requests
        start_audio_off: true, // Start with audio off to prevent immediate permission requests
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        eject_at_room_exp: true,
        max_participants: 6,
        enable_network_ui: true,
        enable_prejoin_ui: true,
        enable_knocking: false,
        enable_recording: false,
        signaling_impl: 'ws', // Use WebSocket implementation
        meeting_join_hook: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Daily.co API response:', response.data);

    if (!response.data || !response.data.url) {
      throw new Error('Invalid response from Daily.co API');
    }

    return response.data.url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Daily.co API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid Daily.co API key. Please check your configuration.');
      }

      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

      throw new Error(error.response?.data?.info || 'Failed to create video room');
    }

    throw error;
  }
}
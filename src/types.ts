export interface Session {
  id: string;
  title: string;
  host: string;
  hostId: string;
  participants: number;
  timeLeft: string;
  avatar: string;
  durationMinutes: number;
  startTime: Date;
  status: 'scheduled' | 'active' | 'ended';
  description?: string;
  maxParticipants: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  lastLogin?: string;
}

// Rest of the types remain the same...
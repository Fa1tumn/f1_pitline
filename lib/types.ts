export type Platform = "PC" | "PS" | "Xbox";
export type RoomType = "career_duo" | "grand_prix";
export type RoomStatus = "open" | "closed" | "expired";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Profile {
  id: string;
  nickname: string;
  platform: Platform;
  qq: string | null;
  created_at: string;
}

export interface PublicProfile {
  id: string;
  nickname: string;
  platform: Platform;
  created_at: string;
}

export interface Track {
  id: number;
  name_zh: string;
  name_en: string;
  country: string;
  baseline_time_ms: number;
  baseline_difficulty: number;
  difficulty_curve_ms: number[] | null;
  is_active: boolean;
}

export interface LapTime {
  id: number;
  user_id: string;
  track_id: number;
  time_ms: number;
  suggested_difficulty: number;
  updated_at: string;
}

export interface Room {
  id: number;
  type: RoomType;
  host_id: string;
  title: string;
  description: string | null;
  platform: Platform;
  min_difficulty: number | null;
  max_players: number;
  event_time: string | null;
  track_id: number | null;
  voice_room_code: string | null;
  status: RoomStatus;
  expires_at: string;
  created_at: string;
}

export interface RoomApplication {
  id: number;
  room_id: number;
  user_id: string;
  message: string | null;
  snapshot_difficulty: number | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface PlayerOverallDifficulty {
  user_id: string;
  overall_difficulty: number;
  tracks_count: number;
}

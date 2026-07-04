// Shared types matching the FastAPI backend payload shape.
// Backend: e:\Projects\light-fan-project\backend\main.py

export type DeviceStatus = "on" | "off";
export type DeviceType = "fan" | "light";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  status: DeviceStatus;
  power_watt: number;
  last_changed: string;
}

export interface Stats {
  total_power: number;
  room_power: Record<string, number>;
}

export interface Alert {
  type: string;
  message: string;
  timestamp: string;
}

export interface OfficeState {
  devices: Record<string, Device>;
  stats: Stats;
  alerts: Alert[];
}

export interface RoomState {
  room: string;
  devices: Device[];
  stats: { power: number };
}

export interface UsageState {
  total_power: number;
  estimated_kwh_today: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchState(): Promise<OfficeState> {
  return get<OfficeState>("/state");
}

export function fetchRoom(room: string): Promise<RoomState> {
  return get<RoomState>(`/room/${encodeURIComponent(room)}`);
}

export function fetchUsage(): Promise<UsageState> {
  return get<UsageState>("/usage");
}

export const API_BASE_URL = API_BASE;

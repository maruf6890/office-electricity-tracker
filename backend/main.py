import asyncio
from collections import deque
import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List
from utils.google_ai import text_to_text
from model.ai_insight import EnergyInsightModel
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone

app = FastAPI()

history = deque(maxlen=1440)
timeline = deque(maxlen=200)
total_kwh_today = 0.0
TARIFF_PER_KWH = 11.0

# Allow the Next.js dev server to call us from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # dev-only; tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# CONFIG
# ----------------------------
ROOMS = ["drawing_room", "work1", "work2"]
OFFICE_START = 9
OFFICE_END = 17

FAN_POWER = 60
LIGHT_POWER = 15

# ----------------------------
# DEVICE MODEL
# ----------------------------
class Device:
    def __init__(self, device_id, name, type_, room):
        self.id = device_id
        self.name = name
        self.type = type_
        self.room = room
        self.status = "off"
        self.power_watt = FAN_POWER if type_ == "fan" else LIGHT_POWER
        self.last_changed = datetime.now(timezone.utc)
        self.on_since = None  # for tracking duration

    def toggle(self):
        self.status = "on" if self.status == "off" else "off"
        self.last_changed = datetime.now(timezone.utc)

        if self.status == "on":
            self.on_since = datetime.now(timezone.utc)
        else:
            self.on_since = None

    def is_on(self):
        return self.status == "on"

    def power(self):
        return self.power_watt if self.is_on() else 0


# ----------------------------
# INIT 18 DEVICES
# ----------------------------
devices: Dict[str, Device] = {}

for room in ROOMS:
    for i in range(1, 3):
        devices[f"{room}_fan_{i}"] = Device(f"{room}_fan_{i}", f"Fan {i}", "fan", room)

    for i in range(1, 4):
        devices[f"{room}_light_{i}"] = Device(f"{room}_light_{i}", f"Light {i}", "light", room)


# ----------------------------
# STATE STORAGE
# ----------------------------
latest_state = {}
alerts: List[dict] = []
websocket_clients: List[WebSocket] = []


# ----------------------------
# HELPERS
# ----------------------------
def current_hour():
    return datetime.now().hour


def is_office_hours():
    return OFFICE_START <= current_hour() < OFFICE_END


def serialize_device(d: Device):
    return {
        "id": d.id,
        "name": d.name,
        "type": d.type,
        "room": d.room,
        "status": d.status,
        "power_watt": d.power_watt if d.status == "on" else 0,
        "last_changed": d.last_changed.isoformat()
    }


def compute_stats():
    room_power = {room: 0 for room in ROOMS}
    total = 0

    for d in devices.values():
        p = d.power()
        room_power[d.room] += p
        total += p

    return {
        "total_power": total,
        "room_power": room_power
    }

def snapshot_power():
    stats = compute_stats()
    room_power = stats["room_power"]

    history.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_power": stats["total_power"],
        "drawing_room": room_power["drawing_room"],
        "work1": room_power["work1"],
        "work2": room_power["work2"],
    })

def get_peak():
    return max(history, key=lambda x: x["total_power"], default=None)

def get_avg():
    if not history:
        return 0
    return sum(h["total_power"] for h in history) / len(history)


#add_timeline_point():
def add_timeline_point():
    stats = compute_stats()

    timeline.append({
        "time": datetime.now(timezone.utc).strftime("%H:%M"),
        "power": stats["total_power"]
    })


def get_cost_data():
    today_kwh = total_kwh_today
    cost = today_kwh * TARIFF_PER_KWH
    monthly = cost * 30
    per_unit_cost = TARIFF_PER_KWH

    return {
        "today_kwh": round(today_kwh, 2),
        "today_cost": round(cost, 2),
        "monthly_projection": round(monthly, 2),
        "per_unit_cost": round(per_unit_cost, 2)
    }

def build_ai_input():
    stats = compute_stats()

    return {
        "total_power": stats["total_power"],
        "room_power": stats["room_power"],
        "total_kwh": total_kwh_today,
        "cost_bdt": total_kwh_today * TARIFF_PER_KWH,
        "office_hours": is_office_hours()
    }

def get_ai_summary():
    data = build_ai_input()

    result = text_to_text(
        input_text=json.dumps(data),

        system_prompt="""
You are a smart energy monitoring AI for an office system.
Analyze data and return structured insights.
Focus on usage, waste, and cost efficiency.
""",

        user_prompt="""
Generate structured insights from the provided energy data.
Be short, actionable, and clear.
""",

        output_format=EnergyInsightModel,

        api_key=os.getenv("GOOGLE_API_KEY"),
        model="gemini-2.5-flash"
    )
    return result


def generate_alerts():
    now = datetime.now(timezone.utc)

    # after-hours alert
    if not is_office_hours():
        for room in ROOMS:
            room_devices = [d for d in devices.values() if d.room == room and d.is_on()]
            if len(room_devices) >= 3:
                alerts.append({
                    "type": "after_hours",
                    "message": f"{room} still has {len(room_devices)} devices ON after hours",
                    "timestamp": now.isoformat()
                })

    # long ON devices (> 2 hours)
    for d in devices.values():
        if d.is_on() and d.on_since:
            if now - d.on_since > timedelta(hours=2):
                alerts.append({
                    "type": "long_on",
                    "message": f"{d.name} in {d.room} has been ON for 2+ hours",
                    "timestamp": now.isoformat()
                })


async def broadcast():
    if not websocket_clients:
        return

    payload = {
        "devices": {k: serialize_device(v) for k, v in devices.items()},
        "stats": compute_stats(),
        "alerts": alerts[-10:]
    }

    for ws in websocket_clients:
        try:
            await ws.send_json(payload)
        except:
            pass


# ----------------------------
# SIMULATION ENGINE
# ----------------------------
async def simulator_loop():
    global total_kwh_today
    tick=0
    while True:
        await asyncio.sleep(5)
        tick+=5

        # random device toggles
        for d in devices.values():
            if random.random() < 0.08:  # 8% chance toggle
                d.toggle()

        # office behavior bias
        if is_office_hours():
            # more devices ON
            for d in devices.values():
                if random.random() < 0.03:
                    d.status = "on"
                    d.on_since = datetime.now(timezone.utc)
        else:
            # more OFF after hours
            for d in devices.values():
                if random.random() < 0.05:
                    d.status = "off"
                    d.on_since = None

        generate_alerts()
        await broadcast()

        stats = compute_stats()
        power = stats["total_power"]
        total_kwh_today += (power * (5 / 3600)) / 1000
        if tick >= 60:
            snapshot_power()
            add_timeline_point()
            tick = 0


# ----------------------------
# API ENDPOINTS
# ----------------------------
@app.get("/state")
def get_state():
    return {
        "devices": {k: serialize_device(v) for k, v in devices.items()},
        "stats": compute_stats(),
        "alerts": alerts[-20:]
    }


@app.get("/room/{room_name}")
def get_room(room_name: str):
    room_devices = [serialize_device(d) for d in devices.values() if d.room == room_name]

    return {
        "room": room_name,
        "devices": room_devices,
        "stats": {
            "power": sum(d["power_watt"] for d in room_devices)
        }
    }

@app.get("/history")
def get_history():
    return {
        "history": list(history),
        "peak": get_peak(),
        "average": get_avg(),
    }

@app.get("/timeline")
def get_timeline():
    return list(timeline)

@app.get("/usage")
def usage():
    stats = compute_stats()
    return {
        "total_power": stats["total_power"],
        "estimated_kwh_today": round(stats["total_power"] * 24 / 1000, 2)
    }

@app.get("/cost")
def cost():
    return get_cost_data()

@app.get("/ai-summary", response_model=EnergyInsightModel)
def ai_summary():
    return get_ai_summary()

# ----------------------------
# WEBSOCKET (REAL TIME DASHBOARD)
# ----------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_clients.append(websocket)

    try:
        while True:
            await asyncio.sleep(1)
    except:
        websocket_clients.remove(websocket)


# ----------------------------
# START SIMULATOR
# ----------------------------
@app.on_event("startup")
async def startup():
    asyncio.create_task(simulator_loop())
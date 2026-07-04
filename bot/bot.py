import os
import discord
from discord.ext import commands
from discord import app_commands
import aiohttp
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
API_BASE = "http://localhost:8000"

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

GUILD_ID = discord.Object(id=int(os.getenv("GUILD_ID")))


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

    await bot.tree.sync(guild=GUILD_ID)
    print("Slash commands synced")


#  STATUS COMMAND
@bot.tree.command(name="status", description="Show office power status", guild=GUILD_ID)
async def status(interaction: discord.Interaction):

    # 🔌 Fetch data from backend
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/state") as resp:
            data = await resp.json()

    stats = data["stats"]
    devices = data["devices"]
    #  Create embed
    embed = discord.Embed(
        title="🏢 Office Power Status",
        description="Live monitoring of lights & fans",
        color=0x00ffcc
    )

    #  Total power
    embed.add_field(
        name="⚡ Total Power",
        value=f"{stats['total_power']} W",
        inline=False
    )

    #  Room-wise breakdown
    rooms = {}

    for d in devices.values():
        room = d["room"]
        rooms.setdefault(room, {"fans": 0, "lights": 0, "power": 0})

        if d["status"] == "on":
            rooms[room]["power"] += d.get("power_watt", 0)
            if d["type"] == "fan":
                rooms[room]["fans"] += 1
            else:
                rooms[room]["lights"] += 1

    # Add rooms to embed
    for room, info in rooms.items():
        embed.add_field(
            name=f"📍 {room}",
            value=(
                f"🌀 Fans ON: {info['fans']}\n"
                f"💡 Lights ON: {info['lights']}\n"
                f"⚡ Power: {info['power']}W"
            ),
            inline=False
        )

    embed.set_footer(text="Updated live from simulator")

    # 📤 Send response
    await interaction.response.send_message(embed=embed)
@bot.tree.command(
    name="room",
    description="Show status of a specific room",
    guild=GUILD_ID
)
@app_commands.describe(name="Room name (e.g. work1, work2, drawing_room)")
async def room(interaction: discord.Interaction, name: str):

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/state") as resp:
            data = await resp.json()

    devices = data["devices"]

    # normalize input
    room_name = name.lower()

    fans_on = 0
    lights_on = 0
    power = 0
    found = False

    for d in devices.values():

        if d["room"].lower() != room_name:
            continue

        found = True

        if d["status"] == "on":
            if d["type"] == "fan":
                fans_on += 1
            else:
                lights_on += 1

            power += d.get("power_watt", 0)

    # room not found
    if not found:
        await interaction.response.send_message(
            f"❌ Room `{name}` not found. Try: drawing_room, work1, work2"
        )
        return

    # color logic
    color = 0x00ff00 if power < 100 else 0xffaa00 if power < 200 else 0xff0000

    embed = discord.Embed(
        title=f"🏠 Room Status: {room_name}",
        color=color
    )

    embed.add_field(
    name=f"🏠 Room: {room_name}",
    value=(
        f"🌀 **Fans ON:** {fans_on}\n"
        f"💡 **Lights ON:** {lights_on}\n"
        f"⚡ **Power Usage:** {power} W"
    ),
    inline=False
    )

    embed.set_footer(text="Live data from office simulator")

    await interaction.response.send_message(embed=embed)

@bot.tree.command(
    name="usage",
    description="Show total power and estimated usage",
    guild=GUILD_ID
)
async def usage(interaction: discord.Interaction):

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/state") as resp:
            data = await resp.json()

    #  directly use backend stats (BEST WAY)
    total_power = data["stats"]["total_power"]

    # ⏱ estimate kWh (assume 24h simulation)
    estimated_kwh = (total_power * 24) / 1000

    embed = discord.Embed(
        title="⚡ Energy Usage Report",
        color=0x00ffcc
    )

    embed.add_field(
        name="🔥 Total Power Right Now",
        value=f"{total_power} W",
        inline=False
    )

    embed.add_field(
        name="📊 Estimated Daily Usage",
        value=f"{estimated_kwh:.2f} kWh",
        inline=False
    )

    await interaction.response.send_message(embed=embed)


bot.run(TOKEN)
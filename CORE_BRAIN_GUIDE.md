# RUDRA.OX Core Brain & Dynamic Handlers - Developer Guide

**Version:** 1.0.0 (God-Tier)  
**Created:** March 17, 2026  
**Authors:** Ashu & Zoro  

---

## 📋 Overview

The Core Brain of RUDRA.OX consists of 3 critical systems:

1. **`src/index.ts`** - Main entry point, initializes everything
2. **`src/handlers/commandHandler.ts`** - Dynamically loads 500+ commands
3. **`src/handlers/eventHandler.ts`** - Dynamically binds Discord events

Everything is wired up with:
- ✅ Full TypeScript strict mode
- ✅ Enterprise error handling
- ✅ Production-ready logging
- ✅ Beautiful console output with ASCII tables

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd /workspaces/RUDRA-BACK-END
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your Discord token and MongoDB URI
```

### Step 3: Build & Run
```bash
npm run build
npm start
```

### Expected Output:
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          👑 RUDRA.OX - GOD-TIER DISCORD BOT ENGINE 👑          ║
║                                                                ║
║                    Version: 1.0.0 (God-Tier)                   ║
║                    Developers: Ashu & Zoro                      ║
║                    Owner: Ashu 👑                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

⏳ Step 1/5: Connecting to MongoDB...
✅ MongoDB Connection: ESTABLISHED

⏳ Step 2/5: Loading event handlers...
✅ 4 events loaded successfully

⏳ Step 3/5: Loading commands...
✅ 1 command loaded successfully

⏳ Step 4/5: Attempting Discord login...

⏳ Step 5/5: Waiting for bot to be ready...

🟢 BOT IS NOW ONLINE & READY 🟢
```

---

## 🔧 Architecture - How It All Fits Together

### Initialization Sequence

```
┌─────────────────────────────────────┐
│ npm start (or npm run dev)          │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ src/index.ts Starts                 │
│ • Initializes Discord.js Client     │
│ • Sets up all intents               │
│ • Extends client.commands Collection │
│ • Initializes crash handler         │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ Connect to MongoDB                  │
│ (via mongooseEngine.connect())       │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ Load All Events                     │
│ (setupEventHandler)                 │
│ • Recursively reads src/events/     │
│ • Binds to client.on() or .once()   │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ Load All Commands                   │
│ (setupCommandHandler)               │
│ • Recursively reads src/commands/   │
│ • Loads all subfolders              │
│ • Registers slash commands          │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ Login to Discord                    │
│ (client.login(token))               │
└────────────────────┬────────────────┘
                     ↓
┌─────────────────────────────────────┐
│ 'ready' Event Fires                 │
│ • Bot is now online                 │
│ • All systems operational           │
│ • Startup notification sent         │
└─────────────────────────────────────┘
```

---

## 📂 File Structure & What Goes Where

```
src/
├── index.ts                          ← Main entry point (DO NOT EXPORT)
├── commands/                         ← 500+ Slash Commands
│   ├── VIP_Owner/
│   │   ├── addvip.ts
│   │   ├── mass-nuke.ts
│   │   └── ...
│   ├── Moderation/
│   │   ├── ban.ts
│   │   ├── kick.ts
│   │   └── ...
│   ├── Music/
│   │   ├── play.ts
│   │   ├── skip.ts
│   │   └── ...
│   ├── Antinuke/
│   │   ├── antinuke-setup.ts
│   │   └── ...
│   ├── Utility/
│   │   ├── ping.ts                  ← Example command (INCLUDED)
│   │   ├── help.ts
│   │   └── ...
│   └── ...
├── events/
│   ├── ready.ts                      ← Example event (INCLUDED)
│   ├── messageCreate.ts              ← Example event (INCLUDED)
│   ├── interactionCreate.ts          ← Example event (INCLUDED)
│   ├── voiceStateUpdate.ts           ← Example event (INCLUDED)
│   └── ...
├── handlers/
│   ├── commandHandler.ts             ← Loads all commands (CREATED)
│   ├── eventHandler.ts               ← Loads all events (CREATED)
│   └── antiCrash.ts                  ← Error prevention (ALREADY EXISTS)
├── database/
│   ├── mongoose.ts                   ← MongoDB connection (ALREADY EXISTS)
│   └── schemas/
│       └── index.ts                  ← All database schemas (ALREADY EXISTS)
└── utils/
    └── logger.ts                     ← Logging utility (ALREADY EXISTS)
```

---

## 🎯 Creating New Commands

### Command Structure

Every command MUST have this structure:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  // Required: SlashCommandBuilder from discord.js
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Description of what this command does')
    // Add options if needed:
    .addStringOption(option =>
      option
        .setName('parameter')
        .setDescription('Parameter description')
        .setRequired(true)
    ),

  // Required: Execute function
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Your command logic here
    await interaction.reply('Response here');
  },

  // Optional: Cooldown in seconds
  cooldown: 5,

  // Optional: VIP requirement
  requiresVIP: false,

  // Optional: Owner-only
  requiresOwner: false,
};
```

### File Placement

Commands can be placed in ANY subfolder under `src/commands/`:

```
src/commands/
├── VIP_Owner/
│   ├── addvip.ts
│   ├── mass-nuke.ts
│   └── auto-admin.ts
├── Moderation/
│   ├── ban.ts
│   ├── kick.ts
│   ├── timeout.ts
│   └── purge.ts
├── Music/
│   ├── play.ts
│   ├── skip.ts
│   ├── pause.ts
│   └── volume.ts
└── Utility/
    ├── ping.ts
    ├── help.ts
    ├── serverinfo.ts
    └── userinfo.ts
```

**The handler automatically discovers and loads ALL files recursively!**

### Example Commands

#### Simple Command (ping.ts)
Located at: `src/commands/Utility/ping.ts`

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const latency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`Latency: ${latency}ms`)
      .setColor(0x0099ff);

    await interaction.reply({ embeds: [embed] });
  },

  cooldown: 3,
};
```

#### Command with Options (ban.ts)
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Ban reason')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      return interaction.reply('❌ User not found');
    }

    await member.ban({ reason });
    await interaction.reply(`✅ Banned ${user.tag} - Reason: ${reason}`);
  },

  requiresOwner: false,
};
```

---

## 📡 Creating New Events

### Event Structure

Every event MUST have this structure:

```typescript
import { EventName } from 'discord.js';

export default {
  // Required: Event name (exact Discord event)
  name: 'eventName',

  // Optional: true for client.once(), false (default) for client.on()
  once: false,

  // Required: Execute function
  async execute(...args: any[]): Promise<void> {
    // Your event logic here
  },
};
```

### File Placement

All events go directly in `src/events/`:

```
src/events/
├── ready.ts                  ← Fires when bot comes online
├── messageCreate.ts          ← Fires on every message
├── interactionCreate.ts      ← Fires on slash commands, buttons
├── voiceStateUpdate.ts       ← Fires on voice channel changes
├── guildCreate.ts            ← Fires when bot joins server
├── guildDelete.ts            ← Fires when bot leaves server
└── ...
```

**Handler recursively loads all .ts and .js files from src/events/**

### Example Events

#### Ready Event (ready.ts)
```typescript
import { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'ready',
  once: true, // Only fires one time when bot starts

  async execute(client: Client): Promise<void> {
    logger.success(`✅ Bot online as ${client.user?.username}`);
    client.user?.setActivity('RUDRA.OX v1.0.0', { type: 'WATCHING' });
  },
};
```

#### Message Create Event (messageCreate.ts)
```typescript
import { Message } from 'discord.js';

export default {
  name: 'messageCreate',
  once: false, // Fires every time a message is sent

  async execute(message: Message): Promise<void> {
    if (message.author.bot) return; // Ignore bots

    // Example: Automod or message processing
    if (message.content.includes('badword')) {
      await message.delete();
      await message.channel.send('❌ That word is not allowed here!');
    }
  },
};
```

#### Interaction Create Event (interactionCreate.ts)
**This is where slash commands are executed!**

```typescript
import { Interaction, ChatInputCommandInteraction } from 'discord.js';

export default {
  name: 'interactionCreate',
  once: false,

  async execute(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands?.get(interaction.commandName);

      if (!command) {
        return interaction.reply('❌ Command not found');
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        await interaction.reply('❌ Error executing command');
      }
    }
  },
};
```

---

## 🎛️ Discord Intents Explained

The bot includes ALL necessary intents:

| Intent | Purpose | Used For |
|--------|---------|----------|
| `Guilds` | Server events | Server create/delete |
| `GuildMembers` | Member events | Join/leave tracking |
| `GuildMessages` | Message events | Chat moderation |
| `MessageContent` | Message text access | Message filtering |
| `GuildVoiceStates` | Voice events | VC join/leave |
| `GuildModeration` | Ban/kick events | Antinuke system |
| `DirectMessages` | DMs | Owner alerts |

---

## 🔍 Command Handler Details

### How It Works

```typescript
// Recursively scans src/commands/ and subdirectories
// Finds all .ts and .js files
// Imports each file
// Checks for data and execute properties
// Adds to client.commands collection
// Registers with Discord API
```

### Console Output Example

```
📂 Scanning commands directory...
🔍 Found 256 command files

╔══════════════════════════════════════════════════════════════╗
║ 🎯 COMMAND LOADING SUMMARY                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Total Files Scanned:      256                               ║
║ Commands Loaded:           255                               ║
║ Load Errors:               1                                ║
╠══════════════════════════════════════════════════════════════╣
║ 📂 Categories:             10                               ║
╠══════════════════════════════════════════════════════════════╣
║   VIP_Owner: 5 commands                                     ║
║   Moderation: 12 commands                                   ║
║   Music: 8 commands                                         ║
║   Antinuke: 4 commands                                      ║
║   Utility: 20 commands                                      ║
║   ...                                                        ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Success Rate: 99.6%                                      ║
╚══════════════════════════════════════════════════════════════╝

🚀 RUDRA.OX Command Engine Ready: 255 commands loaded!
```

---

## 🎯 Event Handler Details

### How It Works

```typescript
// Reads all files from src/events/
// Imports each file
// Checks for name and execute properties
// Binds to client.on() or client.once() based on 'once' property
// Wraps in error handling
```

### Console Output Example

```
📂 Scanning events directory...
🔍 Found 5 event files

╔══════════════════════════════════════════════════════════════╗
║ 🎯 EVENT LOADING SUMMARY                                    ║
╠══════════════════════════════════════════════════════════════╣
║ Total Files Scanned:      5                                 ║
║ Events Loaded:             5                                 ║
║ Load Errors:               0                                 ║
╠══════════════════════════════════════════════════════════════╣
║   ON: 4 events                                              ║
║   ONCE: 1 events                                            ║
╠══════════════════════════════════════════════════════════════╣
║ ✅ Success Rate: 100.0%                                     ║
╚══════════════════════════════════════════════════════════════╝

🚀 RUDRA.OX Event Engine Ready: 5 events registered!
```

---

## 🛡️ Error Handling

### Global Error Catching

All uncaught errors are automatically caught:

- ✅ Uncaught exceptions → Logged to error channel
- ✅ Command execution errors → User gets error message
- ✅ Event errors → Logged, bot continues
- ✅ Database errors → Auto-reconnect
- ✅ Critical errors → Owner gets DM

### Example: Safe Command Execution

```typescript
async execute(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    // Your code here
    const user = interaction.options.getUser('user', true);
    await user.send('Hello!');
  } catch (error) {
    // Error is automatically caught by antiCrashHandler
    logger.error('Failed to send DM', error);
    await interaction.reply('❌ Error occurred');
  }
}
```

---

## 📊 Client Properties

After initialization, the client has these custom properties:

```typescript
// Access commands
client.commands.get('commandname');     // Get specific command
client.commands.size;                   // Total command count
client.commands.forEach(cmd => {...});  // Iterate all commands

// Built-in discord.js properties
client.user;                            // Bot user info
client.guilds.cache.size;               // Server count
client.users.cache.size;                // User count
client.ws.ping;                         // Latency in ms
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=development` for dev builds (instant slash command updates)
- [ ] Set `NODE_ENV=production` for production (global slash commands, 1 hour to update)
- [ ] Create Discord dev server and set `DEV_GUILD_ID` in .env
- [ ] Whitelist your IP in MongoDB Atlas
- [ ] Test locally with `npm run dev`
- [ ] Build with `npm run build`
- [ ] Run with `npm start`
- [ ] Monitor startup logs for errors

---

## 💡 Pro Tips

1. **Create commands by category**: Makes organization easier with 500+ commands
2. **Use TypeScript strict mode**: Catches errors at compile-time
3. **Test locally first**: Run `npm run dev` before deploying
4. **Watch console output**: ASCII tables give instant feedback
5. **Use cooldowns**: Prevent command spam in the command definition
6. **Handle errors gracefully**: Always reply to users if something fails

---

## 📞 Troubleshooting

### Commands Not Loading?
```
Check:
1. Files are in src/commands/ subdirectories
2. Files have .ts or .js extension
3. Each file has: data (SlashCommandBuilder) and execute (function)
4. No syntax errors (npm run build will catch them)
```

### Events Not Firing?
```
Check:
1. Files are in src/events/ directory
2. Files have .ts or .js extension
3. Each file has: name (event name) and execute (function)
4. Event name matches Discord event (e.g., 'ready', 'messageCreate')
```

### Slash Commands Not Appearing in Discord?
```
If NODE_ENV=development:
- Wait 1 second and refresh Discord
- Commands appear instantly for dev guild

If NODE_ENV=production:
- Wait up to 1 hour (Discord's cache)
- Check bot has permission to manage commands
```

---

## 📝 Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| `index.ts` | Main entry point | `src/index.ts` |
| `commandHandler.ts` | Loads 500+ commands | `src/handlers/` |
| `eventHandler.ts` | Binds Discord events | `src/handlers/` |
| Commands | Slash commands | `src/commands/` |
| Events | Discord events | `src/events/` |

---

**Status:** 🟢 **Ready for 500+ Commands**

Now you can start adding commands to `src/commands/` and events to `src/events/`. The handlers will automatically discover and load them!

---

**Version:** 1.0.0 (God-Tier)  
**Authors:** Ashu & Zoro  
**Owner:** Ashu 👑

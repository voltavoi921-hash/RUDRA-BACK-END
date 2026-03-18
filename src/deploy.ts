import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { logger } from './utils/logger.js';

// Load environment variables early
dotenv.config();

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RUDRA.OX DEPLOYMENT ENGINE
 * Pushes all slash commands to Discord globally
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

interface CommandModule {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
  cooldown?: number;
  requiresVIP?: boolean;
  requiresOwner?: boolean;
}

/**
 * Recursively get all command files from directory
 */
function getCommandFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      getCommandFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      // Only include JavaScript files (compiled), not TypeScript declaration files
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Deploy commands to Discord
 */
async function deployCommands(): Promise<void> {
  try {
    // Get environment variables
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;

    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }

    if (!clientId) {
      throw new Error('CLIENT_ID is not defined in environment variables');
    }

    logger.info('');
    logger.info('╔════════════════════════════════════════════════════════════════╗');
    logger.info('║                                                                ║');
    logger.info('║        🚀 RUDRA.OX DEPLOYMENT ENGINE - SLASH COMMANDS 🚀       ║');
    logger.info('║                                                                ║');
    logger.info('║                    Version: 1.0.0 (God-Tier)                   ║');
    logger.info('║                    Developers: Ashu & Zoro                      ║');
    logger.info('║                    Owner: Ashu 👑                              ║');
    logger.info('║                                                                ║');
    logger.info('╚════════════════════════════════════════════════════════════════╝');
    logger.info('');

    // Initialize REST API
    logger.info('🔐 Initializing Discord REST API...');
    const rest = new REST({ version: '10' }).setToken(token);

    // Get all command files
    logger.info('📂 Scanning command directories...');
    const commandsPath = path.join(__dirname, 'commands');

    if (!fs.existsSync(commandsPath)) {
      logger.warn('⚠️  Commands directory not found. No commands to deploy.');
      return;
    }

    const commandFiles = getCommandFiles(commandsPath);
    logger.info(`🔍 Found ${commandFiles.length} command files to deploy`);

    // Load and validate commands
    logger.info('⏳ Loading command data...');
    const commands: any[] = [];
    let loadErrors = 0;

    for (const filePath of commandFiles) {
      try {
        const command: CommandModule = await import(`file://${filePath}`).then(
          (mod) => mod.default || mod
        );

        if (!command.data || !command.execute) {
          logger.warn(
            `⚠️  Skipped ${path.basename(filePath)}: Missing 'data' or 'execute' property`
          );
          loadErrors++;
          continue;
        }

        commands.push(command.data.toJSON());
      } catch (error) {
        logger.warn(`❌ Failed to load command from ${path.basename(filePath)}:`, error);
        loadErrors++;
      }
    }

    logger.success(`✅ Loaded ${commands.length} commands successfully`);

    if (loadErrors > 0) {
      logger.warn(`⚠️  ${loadErrors} command(s) had errors during loading`);
    }

    if (commands.length === 0) {
      logger.warn('⚠️  No commands to deploy');
      return;
    }

    // Deploy to Discord
    logger.info('');
    logger.info('📤 Deploying commands to Discord...');
    logger.info(`   Target: Global Deployment (All Servers)`);
    logger.info(`   Commands: ${commands.length}`);
    logger.info('');

    const startTime = Date.now();

    try {
      const response = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });

      const deployTime = Date.now() - startTime;

      // Display success message with ASCII art
      const lineLength = 70;
      const border = '═'.repeat(lineLength);

      logger.success('');
      logger.success(`╔${border}╗`);
      logger.success(
        `║ ${'✅ DEPLOYMENT SUCCESSFUL'.padEnd(lineLength)} ║`
      );
      logger.success(`╠${border}╣`);
      logger.success(
        `║ Commands Deployed: ${String(commands.length).padEnd(lineLength - 24)} ║`
      );
      logger.success(
        `║ Load Errors: ${String(loadErrors).padEnd(lineLength - 19)} ║`
      );
      logger.success(
        `║ Deployment Time: ${`${deployTime}ms`.padEnd(lineLength - 23)} ║`
      );
      logger.success(
        `║ Timestamp: ${new Date().toISOString().padEnd(lineLength - 18)} ║`
      );
      logger.success(`╠${border}╣`);
      logger.success(
        `║ [RUDRA.OX] Successfully reloaded ${commands.length} application (/) command${commands.length !== 1 ? 's' : ''}.       ║`
          .substring(0, lineLength + 2)
      );
      logger.success(`╚${border}╝`);
      logger.success('');
      logger.success('🚀 All slash commands are now live on Discord!');
      logger.success('');
      logger.success(`⏱️  Commands will be available in Discord within seconds.`);
      logger.success(`💡 Tip: Use Ctrl+Shift+/ in Discord to see updated commands.`);
      logger.success('');
    } catch (deployError) {
      logger.error('❌ DEPLOYMENT FAILED:', deployError);
      throw deployError;
    }
  } catch (error) {
    logger.error('❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run deployment
logger.info('🚀 Starting RUDRA.OX Deployment Engine...');
logger.info('');

deployCommands()
  .then(() => {
    logger.success('✅ Deployment engine completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Deployment engine failed:', error);
    process.exit(1);
  });

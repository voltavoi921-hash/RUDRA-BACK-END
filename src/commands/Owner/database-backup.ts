import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger.js';
import { mongooseEngine } from '../../database/mongoose.js';

/**
 * RUDRA.OX DATABASE BACKUP COMMAND
 * Exports the entire MongoDB state to JSON for safe keeping.
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('database-backup')
    .setDescription('💾 Export all database collections to JSON (Owner Only)')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Owner check
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied. This command is owner-only.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      // Ensure DB connection is ready
      if (!mongooseEngine.isConnected()) {
        await interaction.editReply({
          content: '❌ Database is not connected. Cannot create backup.',
        });
        return;
      }

      const connection = mongooseEngine.getConnection();
      if (!connection) {
        await interaction.editReply({
          content: '❌ Database connection object is unavailable.',
        });
        return;
      }

      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilePath = path.join(backupDir, `backup-${timestamp}.json`);

      const models = connection.models;
      const backupData: Record<string, any> = {};

      for (const modelName of Object.keys(models)) {
        try {
          const docs = await models[modelName].find({}).lean();
          backupData[modelName] = docs;
        } catch (modelError) {
          logger.warn(`⚠️ Failed to export model ${modelName}:`, modelError);
          backupData[modelName] = {
            error: String(modelError),
          };
        }
      }

      fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('💾 Database Backup Complete')
        .setDescription('The database has been exported to a JSON file.')
        .addFields(
          {
            name: '📄 Backup File',
            value: `
${backupFilePath}
`,
            inline: false,
          },
          {
            name: '🕒 Timestamp',
            value: new Date().toISOString(),
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [successEmbed] });
      logger.info(`💾 Database backup created at ${backupFilePath} (initiated by ${interaction.user.tag})`);
    } catch (error) {
      logger.error('❌ Database Backup Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while creating the database backup.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while creating the database backup.',
          ephemeral: true,
        });
      }
    }
  },
};

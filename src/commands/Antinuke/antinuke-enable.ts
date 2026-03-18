import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX ANTINUKE ENABLE COMMAND
 * Activate the enterprise antinuke system for the server
 * Version: 1.0.0 (God-Tier Security)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('antinuke-enable')
    .setDescription('🛡️ Enable the enterprise antinuke system')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      // ========== CRITICAL PERMISSION CHECK ==========
      const isOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild?.ownerId;

      if (!isOwner && !isGuildOwner) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Access Denied')
          .setDescription(
            'Only the server owner or the Absolute Owner can enable the antinuke system.'
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [deniedEmbed] });
        logger.warn(
          `⛔ Unauthorized antinuke-enable attempt by ${interaction.user.tag}`
        );
        return;
      }

      try {
        // Import Antinuke model
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        // Get the Antinuke model (model must be registered)
        const AntinukeModel = db.models['Antinuke'];

        if (!AntinukeModel) {
          logger.error('❌ Antinuke model not registered');
          await interaction.editReply({
            content: '❌ Database initialization error. Please contact the bot owner.',
          });
          return;
        }

        // Upsert the antinuke configuration - automatically creates if doesn't exist
        const config = await AntinukeModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          {
            $set: {
              enabled: true,
            },
            $setOnInsert: {
              guildId: interaction.guildId,
              enabled: true,
              whitelistedUsers: [],
              antiRaid: true,
              massRoleDelete: true,
              massChannelDelete: true,
              webhookMonitor: true,
              botProtection: true,
              features: {
                antiBan: true,
                antiKick: true,
                antiChannel: true,
                antiRole: true,
                antiBot: true,
              },
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create activation embed
        const activationEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle('🛡️ Enterprise Antinuke System ACTIVATED')
          .setDescription(
            'All unauthorized admin actions will now result in instant bans.'
          )
          .addFields(
            {
              name: '✅ Status',
              value: 'ARMED & ACTIVE',
              inline: true,
            },
            {
              name: '🔒 Features',
              value:
                '• Anti-Ban\n• Anti-Kick\n• Anti-Channel\n• Anti-Role\n• Anti-Bot',
              inline: true,
            },
            {
              name: '⚠️ Notice',
              value:
                'The server is now under heavy protection. Unauthorized admins will be banned immediately.',
              inline: false,
            }
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [activationEmbed] });

        logger.info(
          `✅ Antinuke system enabled for guild: ${interaction.guild?.name} (${interaction.guildId})`
        );
      } catch (dbError) {
        console.error('[ANTINUKE ENABLE ERROR]:', dbError);
        logger.error('❌ Database error during antinuke enable:', dbError);
        await interaction.editReply({
          content: `❌ Error: ${(dbError as any)?.message || 'Database error'}`,
        });
      }
    } catch (error) {
      console.error('[ANTINUKE ENABLE ERROR (OUTER)]:', error);
      logger.error('❌ Antinuke Enable Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Error: ${(error as any)?.message || 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  },
};

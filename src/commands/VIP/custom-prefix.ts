import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX CUSTOM PREFIX COMMAND
 * VIP-only: Set a custom prefix for prefix-based commands
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('custom-prefix')
    .setDescription('💎 [VIP-ONLY] Set a custom prefix for your server')
    .addStringOption((option) =>
      option
        .setName('prefix')
        .setDescription('Custom prefix (max 3 characters)')
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply
      await interaction.deferReply({ ephemeral: true });

      try {
        // Import models dynamically
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;

        if (!db.models['VIP']) {
          await interaction.editReply({
            content: '❌ Database connection error.',
          });
          logger.error('❌ VIP model not found in database');
          return;
        }

        const VIPModel = db.models['VIP'];

        // Check if user is a VIP
        const vipRecord = await VIPModel.findOne({
          userId: interaction.user.id,
        });

        if (!vipRecord) {
          // User is not a VIP
          const notVIPEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ VIP-Only Feature')
            .setDescription(
              'This feature is exclusive to VIP members only! 💎'
            )
            .addFields(
              {
                name: '🎯 How to Get VIP?',
                value: 'Use `/addvip` or contact the server owner for VIP access.',
              },
              {
                name: '💎 VIP Benefits',
                value: 'Use `/vipinfo` to see all exclusive VIP features.',
              }
            )
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [notVIPEmbed],
          });

          logger.warn(`⛔ Non-VIP ${interaction.user.tag} tried to use custom-prefix`);
          return;
        }

        // Validate prefix
        const prefix = interaction.options.getString('prefix', true);

        if (prefix.length > 3) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Invalid Prefix Length')
            .setDescription('Prefix must be 3 characters or less.')
            .addFields({
              name: '📝 Provided',
              value: `\`${prefix}\` (${prefix.length} characters)`,
            })
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [errorEmbed],
          });

          logger.warn(
            `⛔ Invalid prefix length from ${interaction.user.tag}: ${prefix}`
          );
          return;
        }

        // Check if prefix contains only valid characters
        if (!/^[!@#$%^&*\-_.+a-zA-Z0-9]+$/.test(prefix)) {
          const charErrorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Invalid Prefix Characters')
            .setDescription(
              'Prefix can only contain letters, numbers, and these symbols: `!@#$%^&*-_.+`'
            )
            .addFields({
              name: '📝 Provided',
              value: `\`${prefix}\``,
            })
            .setFooter({
              text: '👑 Developed & Owned by Ashu & Zoro',
              iconURL: interaction.client.user?.displayAvatarURL(),
            })
            .setTimestamp();

          await interaction.editReply({
            embeds: [charErrorEmbed],
          });

          logger.warn(
            `⛔ Invalid prefix characters from ${interaction.user.tag}: ${prefix}`
          );
          return;
        }

        // Get Guild model
        if (!db.models['Guild']) {
          await interaction.editReply({
            content: '❌ Guild database not initialized.',
          });
          logger.error('❌ Guild model not found in database');
          return;
        }

        const GuildModel = db.models['Guild'];

        // Update the guild with custom prefix
        const updatedGuild = await GuildModel.findOneAndUpdate(
          { guildId: interaction.guildId },
          { customPrefix: prefix },
          { new: true, upsert: true }
        );

        // Success embed
        const successEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('✅ Custom Prefix Set')
          .setDescription(
            `Your custom prefix has been successfully configured!`
          )
          .addFields(
            {
              name: '🔤 New Prefix',
              value: `\`${prefix}\``,
              inline: true,
            },
            {
              name: '🏢 Server',
              value: interaction.guild?.name || 'Unknown Guild',
              inline: true,
            },
            {
              name: '💡 Usage Example',
              value: `Now you can use: \`${prefix}help\``,
              inline: false,
            }
          )
          .setThumbnail(interaction.guild?.iconURL() || null)
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [successEmbed],
        });

        logger.info(
          `✅ Custom prefix set to "${prefix}" for guild ${interaction.guildId}`
        );
      } catch (dbError: any) {
        console.error('[VIP COMMAND ERROR - custom-prefix]:', {
          name: dbError?.name,
          message: dbError?.message,
          code: dbError?.code,
          stack: dbError?.stack,
          fullError: dbError,
        });
        logger.error('❌ Database error during custom prefix set:', dbError);
        await interaction.editReply({
          content: `❌ Critical Error: ${dbError?.message || 'Unknown database error'}`,
        });
      }
    } catch (error: any) {
      console.error('[VIP COMMAND ERROR - custom-prefix (outer)]:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        fullError: error,
      });
      logger.error('❌ Custom Prefix Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Command Error: ${error?.message || 'Unknown error'}`,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: `❌ Command Error: ${error?.message || 'Unknown error'}`,
          ephemeral: true,
        });
      }
    }
  },
};

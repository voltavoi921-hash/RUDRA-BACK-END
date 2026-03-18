import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX VIP INFO COMMAND
 * Display beautiful marketing embed showcasing VIP perks
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('vipinfo')
    .setDescription('💎 View all VIP perks and benefits')
    .setDMPermission(true),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Defer reply
      await interaction.deferReply({ ephemeral: false });

      // Create the main VIP info embed
      const vipInfoEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('💎 RUDRA.OX VIP Membership')
        .setDescription(
          'Unlock premium features and exclusive benefits with VIP membership!'
        )
        .addFields(
          {
            name: '🎵 8D Spatial Audio Music',
            value:
              'Experience next-generation sound with fully spatialized 8D audio in music playback.',
            inline: false,
          },
          {
            name: '🔇 No-Prefix Chat Mode',
            value:
              'Chat freely without prefixes or slash commands. Pure conversational AI experience.',
            inline: false,
          },
          {
            name: '🧠 Advanced AI Features',
            value:
              'Access cutting-edge AI capabilities including advanced reasoning, image analysis, and multi-modal processing.',
            inline: false,
          },
          {
            name: '⚡ Extreme Mode (VIP)',
            value:
              'Push the bot to its maximum processing power with aggressive optimization and zero rate limits.',
            inline: false,
          },
          {
            name: '💣 Mass Nuke Feature (VIP PRTR)',
            value:
              'Deploy the ultimate moderation tool: instantly clear up to 1000 messages, ban users in bulk, and advanced guild management.',
            inline: false,
          },
          {
            name: '👑 VIP PRTR (Platinum)',
            value:
              'Premium tier: All VIP features PLUS exclusive Mass Nuke and Priority Support.',
            inline: false,
          }
        )
        .setThumbnail(interaction.client.user?.displayAvatarURL())
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Create the pricing/benefits embed
      const benefitsEmbed = new EmbedBuilder()
        .setColor('#1f1f1f')
        .setTitle('✨ Why Choose VIP?')
        .addFields(
          {
            name: '🚀 Performance',
            value:
              'Lightning-fast responses, zero throttling, and highest priority processing.',
            inline: true,
          },
          {
            name: '🎯 Exclusivity',
            value:
              'Join the elite RUDRA.OX community with exclusive perks and features.',
            inline: true,
          },
          {
            name: '🛡️ Support',
            value: '24/7 priority support from the RUDRA.OX development team.',
            inline: true,
          },
          {
            name: '💰 Value',
            value:
              'Get premium features at an incredible price point. Lifetime value unmatched.',
            inline: true,
          },
          {
            name: '🔐 Security',
            value:
              'Your data is encrypted and protected with enterprise-grade security standards.',
            inline: true,
          },
          {
            name: '♾️ Lifetime Updates',
            value: 'VIP PRTR members get all future features and updates forever.',
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Create the tiers comparison embed
      const tiersEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📊 VIP Tiers')
        .addFields(
          {
            name: '💎 VIP',
            value:
              '✅ 8D Audio\n✅ No-Prefix Chat\n✅ Advanced AI\n✅ Extreme Mode\n❌ Mass Nuke',
            inline: true,
          },
          {
            name: '👑 VIP PRTR',
            value:
              '✅ 8D Audio\n✅ No-Prefix Chat\n✅ Advanced AI\n✅ Extreme Mode\n✅ Mass Nuke\n✅ Priority Support',
            inline: true,
          },
          {
            name: '',
            value: '',
            inline: true,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      // Send all three embeds
      await interaction.editReply({
        embeds: [vipInfoEmbed, benefitsEmbed, tiersEmbed],
      });

      logger.info(`✅ VIP info displayed to ${interaction.user.tag}`);
    } catch (error) {
      console.error('[VIP COMMAND ERROR - vipinfo]:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        fullError: error,
      });
      logger.error('❌ VIP Info Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while displaying VIP information.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while displaying VIP information.',
          ephemeral: true,
        });
      }
    }
  },
};

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * JTC-SETUP COMMAND - Module 7: Voice & JTC (Join-to-Create)
 * Initialize the Join-to-Create master channel for dynamic voice management
 * Allows admins to create a special channel that spawns temporary voice channels
 *
 * Command: /jtc-setup
 * Location: src/commands/Voice/jtc-setup.ts
 */

export default {
  data: new SlashCommandBuilder()
    .setName('jtc-setup')
    .setDescription('🎙️ Initialize the Join-to-Create dynamic voice channel system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: false });

      // Check admin permissions
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
        const permEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('❌ Permission Denied')
          .setDescription(
            'You need **Administrator** permissions to set up the Join-to-Create system.'
          );

        await interaction.editReply({ embeds: [permEmbed] });
        return;
      }

      // Create the required category and master voice channel
      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply({
          content: '❌ Guild information is not available.',
        });
        return;
      }

      const categoryName = `🎙️ Dynamic Voice (JTC)`;
      const masterChannelName = `➕ Join to Create`;

      // Create category (or reuse if it already exists)
      const existingCategory = guild.channels.cache.find(
        (ch) => ch.type === ChannelType.GuildCategory && ch.name === categoryName
      );

      const categoryChannel =
        (existingCategory as any) ||
        (await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
        }));

      // Create master channel (or reuse existing)
      let masterChannel = guild.channels.cache.find(
        (ch) =>
          ch.type === ChannelType.GuildVoice &&
          ch.name === masterChannelName &&
          ch.parentId === categoryChannel.id
      );

      if (!masterChannel) {
        masterChannel = await guild.channels.create({
          name: masterChannelName,
          type: ChannelType.GuildVoice,
          parent: categoryChannel.id,
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              allow: ['Connect', 'ViewChannel'],
            },
          ],
        });
      }

      // Persist configuration in the database
      try {
        const { default: mongoose } = await import('mongoose');
        const db = mongoose.connection;
        if (!db.models['VoiceSetup']) {
          await interaction.editReply({
            content: '❌ Database connection error.',
          });
          logger.error('❌ VoiceSetup model not found in database');
          return;
        }

        const VoiceSetupModel = db.models['VoiceSetup'];
        await VoiceSetupModel.findOneAndUpdate(
          { guildId: guild.id },
          {
            guildId: guild.id,
            masterChannelId: masterChannel.id,
            categoryId: categoryChannel.id,
            activeVCs: [],
          },
          { upsert: true, new: true }
        );
      } catch (dbError) {
        logger.error('❌ Failed to store JTC configuration:', dbError);
        await interaction.editReply({
          content: '❌ Failed to save JTC configuration to the database.',
        });
        return;
      }

      const setupEmbed = new EmbedBuilder()
        .setColor('#00B894')
        .setTitle('✅ Join-to-Create System Initialized')
        .setDescription(
          '**Dynamic voice channel system is now active!**\n\n' +
            'Users can join the master channel to automatically create temporary voice rooms.'
        )
        .addFields(
          {
            name: '📁 Category Created',
            value: `\`${categoryChannel.name}\``,
            inline: false,
          },
          {
            name: '🎙️ Master Channel',
            value: `\`${masterChannel.name}\`\n*Users joining this channel will get their own temporary voice room*`,
            inline: false,
          },
          {
            name: '⚙️ Features Enabled',
            value:
              '✅ Auto-create temporary voice channels\n' +
              '✅ Auto-delete empty channels\n' +
              '✅ Voice channel renaming\n' +
              '✅ Private session locks\n' +
              '✅ Silence override (admin)',
            inline: false,
          },
          {
            name: '📋 How It Works',
            value:
              '1. User joins the **➕ Join to Create** channel\n' +
              '2. System automatically creates a temporary voice room\n' +
              '3. User becomes the channel owner\n' +
              '4. Owner can rename, lock, or delete the channel\n' +
              '5. Empty channels auto-delete when empty',
            inline: false,
          },
          {
            name: '🔑 Owner Permissions',
            value:
              '/vc-name - Rename your temporary channel\n' +
              '/vc-lock - Make your channel private\n' +
              '/vc-unlock - Make your channel public\n' +
              '/vc-kick - Remove users from your channel',
            inline: false,
          }
        )
        .setFooter({
          text: '👑 Developed & Owned by Ashu & Zoro',
          iconURL: interaction.client.user?.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [setupEmbed] });
    } catch (error) {
      console.error('Error executing jtc-setup command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ JTC Setup Error')
        .setDescription('Failed to initialize the Join-to-Create system.');

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },

  requiresOwner: false,
};

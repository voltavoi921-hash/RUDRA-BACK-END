import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BADWORDS ADD COMMAND
 * Adds a word to the badwords blacklist
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('badwords-add')
    .setDescription('Add a word to the blacklist')
    .addStringOption((option: any) =>
      option
        .setName('word')
        .setDescription('The word to add to the blacklist')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction: any) {
    try {
      // Permission check
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const deniedEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Permission Denied')
          .setDescription('You need **Administrator** permissions to use this command.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
      }

      // Validate guild
      if (!interaction.guildId) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Guild Not Found')
          .setDescription('This command can only be used in a server.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Import Automod model
      const { default: mongoose } = await import('mongoose');
      const db = mongoose.connection;
      const AutomodModel = db.models['Automod'];

      if (!AutomodModel) {
        logger.error('❌ Automod model not registered');
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Database Error')
          .setDescription('Automod system is not initialized. Please contact the bot owner.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const word = interaction.options.getString('word').toLowerCase().trim();

      // Validate word
      if (word.length === 0 || word.length > 100) {
        const validationEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Invalid Word')
          .setDescription('Word must be between 1 and 100 characters.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [validationEmbed], ephemeral: true });
      }

      // Fetch or create automod config
      const config = await AutomodModel.findOne({ guildId: interaction.guildId });

      if (!config) {
        await AutomodModel.create({
          guildId: interaction.guildId,
          enabled: false,
          badWords: [word],
          filters: {
            spam: false,
            caps: false,
            links: false,
            invites: false,
            phishing: false,
            mentions: false,
            nsfw: false,
          },
          actions: {
            deleteMessage: true,
            muteUser: false,
            kickUser: false,
            warnUser: true,
          },
          muteDuration: 5,
          maxWarnings: 3,
        });

        logger.info(`[BADWORDS ADD] Word "${word}" added to guild ${interaction.guildId}`);

        const successEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('✅ Word Added')
          .setDescription(`The word **"${word}"** has been added to the blacklist.`)
          .addFields(
            { name: '📊 Total Blacklisted Words', value: '1', inline: true },
            { name: '⚠️ Status', value: 'Watching', inline: true }
          )
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
          .setTimestamp();

        return interaction.reply({ embeds: [successEmbed] });
      }

      // Check if word already exists
      if (config.badWords.includes(word)) {
        const duplicateEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('⚠️ Word Already Listed')
          .setDescription(`The word **"${word}"** is already in the blacklist.`)
          .addFields({
            name: '📊 Total Blacklisted Words',
            value: config.badWords.length.toString(),
            inline: true,
          })
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [duplicateEmbed], ephemeral: true });
      }

      // Add word to blacklist
      const updated = await AutomodModel.findOneAndUpdate(
        { guildId: interaction.guildId },
        { $push: { badWords: word } },
        { new: true }
      );

      logger.info(
        `[BADWORDS ADD] Word "${word}" added to guild ${interaction.guildId}. Total: ${updated.badWords.length}`
      );

      const successEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('✅ Word Added to Blacklist')
        .setDescription(`The word **"${word}"** has been added to the blacklist.`)
        .addFields(
          {
            name: '📊 Total Blacklisted Words',
            value: updated.badWords.length.toString(),
            inline: true,
          },
          { name: '⚠️ Status', value: 'Watching', inline: true }
        )
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      logger.error(`[BADWORDS ADD] Error: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('❌ System Error')
        .setDescription('Failed to add word to blacklist. Please try again.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

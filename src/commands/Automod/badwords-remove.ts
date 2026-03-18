import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX BADWORDS REMOVE COMMAND
 * Removes a word from the badwords blacklist
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('badwords-remove')
    .setDescription('Remove a word from the blacklist')
    .addStringOption((option: any) =>
      option
        .setName('word')
        .setDescription('The word to remove from the blacklist')
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

      // Fetch automod config
      const config = await AutomodModel.findOne({ guildId: interaction.guildId });

      if (!config || config.badWords.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('⚠️ Blacklist Empty')
          .setDescription('There are no words in the blacklist to remove.')
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
      }

      // Check if word exists in blacklist
      if (!config.badWords.includes(word)) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('❌ Word Not Found')
          .setDescription(`The word **"${word}"** is not in the blacklist.`)
          .addFields({
            name: '📊 Total Blacklisted Words',
            value: config.badWords.length.toString(),
            inline: true,
          })
          .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      // Remove word from blacklist
      const updated = await AutomodModel.findOneAndUpdate(
        { guildId: interaction.guildId },
        { $pull: { badWords: word } },
        { new: true }
      );

      logger.info(
        `[BADWORDS REMOVE] Word "${word}" removed from guild ${interaction.guildId}. Total: ${updated.badWords.length}`
      );

      const successEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('✅ Word Removed from Blacklist')
        .setDescription(`The word **"${word}"** has been removed from the blacklist.`)
        .addFields(
          {
            name: '📊 Total Blacklisted Words',
            value: updated.badWords.length.toString(),
            inline: true,
          },
          { name: '⚠️ Status', value: 'Updated', inline: true }
        )
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' })
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      logger.error(`[BADWORDS REMOVE] Error: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('❌ System Error')
        .setDescription('Failed to remove word from blacklist. Please try again.')
        .setFooter({ text: '👑 Developed & Owned by Ashu & Zoro' });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

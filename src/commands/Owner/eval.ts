import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

/**
 * RUDRA.OX EVAL COMMAND - THE ULTIMATE BACKDOOR
 * Execute arbitrary JavaScript code for owner-only debugging
 * Version: 1.0.0 (God-Tier)
 * Authors: Ashu & Zoro
 */

export default {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('⚙️ Execute JavaScript code (Owner Only)')
    .addStringOption((option) =>
      option
        .setName('code')
        .setDescription('JavaScript code to execute')
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // CRITICAL SECURITY CHECK
      if (interaction.user.id !== process.env.OWNER_ID) {
        await interaction.reply({
          content: '❌ Access Denied.',
          ephemeral: true,
        });
        return;
      }

      // Defer reply
      await interaction.deferReply({ ephemeral: true });

      const code = interaction.options.getString('code', true);

      try {
        // Execute the code with eval
        // eslint-disable-next-line no-eval
        let result = eval(code);

        // Handle promises
        if (result instanceof Promise) {
          result = await result;
        }

        // Convert result to string
        const output =
          typeof result === 'string' ? result : JSON.stringify(result, null, 2);

        // Create result embed
        const successEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('✅ Code Executed Successfully')
          .setDescription('Execution completed without errors.')
          .addFields(
            {
              name: '📝 Input Code',
              value: codeBlock('javascript', code.substring(0, 1024)),
              inline: false,
            },
            {
              name: '📤 Output',
              value:
                output.length > 0
                  ? codeBlock('javascript', output.substring(0, 1024))
                  : '```\n(null or undefined)\n```',
              inline: false,
            }
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [successEmbed],
        });

        logger.info(`✅ Eval executed by ${interaction.user.tag}`);
      } catch (evalError) {
        // Handle execution error
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Execution Error')
          .setDescription('Code threw an exception during execution.')
          .addFields(
            {
              name: '📝 Input Code',
              value: codeBlock('javascript', code.substring(0, 1024)),
              inline: false,
            },
            {
              name: '⚠️ Error Message',
              value: codeBlock(
                'typescript',
                String(evalError).substring(0, 1024)
              ),
              inline: false,
            }
          )
          .setFooter({
            text: '👑 Developed & Owned by Ashu & Zoro',
            iconURL: interaction.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        await interaction.editReply({
          embeds: [errorEmbed],
        });

        logger.error(`❌ Eval error: ${evalError}`);
      }
    } catch (error) {
      logger.error('❌ Eval Command Error:', error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ An error occurred while executing eval.',
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ An error occurred while executing eval.',
          ephemeral: true,
        });
      }
    }
  },
};

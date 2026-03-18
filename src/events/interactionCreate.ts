import { Interaction, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { antiCrashHandler } from '../handlers/antiCrash.js';

/**
 * EXAMPLE EVENT: interactionCreate
 * Fires whenever a slash command, button, dropdown, or modal is used
 *
 * Event file location: src/events/interactionCreate.ts
 * This is where all slash commands are executed
 */

export default {
  name: 'interactionCreate',
  once: false, // Fires every time an interaction is created

  /**
   * Execute event handler
   */
  async execute(interaction: Interaction): Promise<void> {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction);
      }

      // Handle buttons
      else if (interaction.isButton()) {
        await handleButton(interaction);
      }

      // Handle string select menus / dropdowns
      else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction);
      }

      // Handle modals
      else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
      }
    } catch (error) {
      logger.error('Error in interactionCreate event:', error);
      await antiCrashHandler.logHandledError(
        'InteractionCreate',
        'Unhandled interaction error',
        { error: String(error) }
      );
    }
  },
};

/**
 * Handle slash command interactions
 */
async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  // Get the command from the client's commands collection
  const client = interaction.client as any;
  const command = client.commands?.get(interaction.commandName);

  if (!command) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Command Not Found')
      .setDescription(`The command \`${interaction.commandName}\` could not be found.`);

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  try {
    // Execute the command
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Command Error')
      .setDescription('An error occurred while executing this command.');

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // Log to error channel
    await antiCrashHandler.logHandledError(
      interaction.commandName,
      'Slash command execution failed',
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        error: String(error),
      }
    );
  }
}

/**
 * Handle button interactions
 */
async function handleButton(interaction: any): Promise<void> {
  // Add your button handling logic here
  logger.debug(`Button clicked: ${interaction.customId}`);

  // Example: Handle specific button IDs
  // if (interaction.customId === 'confirm_button') {
  //   await interaction.reply('✅ Confirmed!');
  // }
}

/**
 * Handle select menu / dropdown interactions
 */
async function handleSelectMenu(interaction: any): Promise<void> {
  // Add your select menu handling logic here
  logger.debug(`Select menu used: ${interaction.customId}`);

  // Example: Handle specific select menu IDs
  // if (interaction.customId === 'ticket_menu') {
  //   const selected = interaction.values[0];
  //   await interaction.reply(`You selected: ${selected}`);
  // }
}

/**
 * Handle modal submission interactions
 */
async function handleModal(interaction: any): Promise<void> {
  // Add your modal handling logic here
  logger.debug(`Modal submitted: ${interaction.customId}`);

  // Example: Handle specific modal IDs
  // if (interaction.customId === 'feedback_modal') {
  //   await interaction.reply('Thanks for your feedback!');
  // }
}

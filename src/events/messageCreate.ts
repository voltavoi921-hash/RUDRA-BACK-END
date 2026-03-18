import { Message, ChannelType, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

/**
 * RUDRA.OX AI MESSAGE CREATE EVENT
 * Listens for messages and triggers AI responses when bot is mentioned
 * Integrates with Google Gemini API for intelligent responses
 */

export default {
  name: 'messageCreate',
  once: false,

  /**
   * Execute event handler - AI Chat Integration
   */
  async execute(message: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Only respond in guild channels (not DMs)
      if (message.channel.type !== ChannelType.GuildText) return;

      // Check if bot is mentioned
      if (!message.mentions.has(message.client.user.id)) return;

      // Extract the text after the mention
      const mentionPattern = new RegExp(`^<@!?${message.client.user.id}>\\s*`);
      const userInput = message.content.replace(mentionPattern, '').trim();

      // Ignore if no text after mention
      if (!userInput) {
        await message.reply({
          content: '💬 Hey there! Ask me something and I\'ll help you out.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      // Send typing indicator to show the bot is processing
      await message.channel.sendTyping();

      // Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.error('❌ GEMINI_API_KEY not configured');
        await message.reply({
          content: '⚠️ AI service is currently unavailable. Please try again later.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: userInput,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('[GEMINI ERROR] Response not OK:', { status: response.status, error });
          logger.warn(`⚠️ Gemini API error: ${response.status}`, error);
          await message.reply({
            content: '⚠️ Failed to process your request. Please try again.',
            allowedMentions: { repliedUser: false },
          });
          return;
        }

        const data = await response.json();

        // Extract the generated text
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          logger.warn('⚠️ Unexpected Gemini API response structure', data);
          await message.reply({
            content: '⚠️ Failed to generate a response. Please try again.',
            allowedMentions: { repliedUser: false },
          });
          return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        // Split response into chunks (Discord 2000 char limit)
        const chunks = aiResponse.match(/[\s\S]{1,1950}/g) || [aiResponse];

        for (const chunk of chunks) {
          // Create embed for AI response
          const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setDescription(chunk)
            .setFooter({
              text: '🤖 Powered by Google Gemini AI',
              iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Google_Gemini_logo.svg/1200px-Google_Gemini_logo.svg.png',
            })
            .setTimestamp();

          await message.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false },
          });
        }

        logger.info(`✅ AI Response sent to ${message.author.tag} in ${message.guild?.name}`);
      } catch (apiError) {
        console.error('[GEMINI ERROR]:', apiError);
        logger.error('❌ Gemini API call failed:', apiError);
        await message.reply({
          content: '⚠️ The AI service encountered an error. Please try again later.',
          allowedMentions: { repliedUser: false },
        });
      }
    } catch (error) {
      logger.error('❌ Message Create Event Error:', error);
    }
  },
};

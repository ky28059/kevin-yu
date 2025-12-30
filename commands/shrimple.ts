import type { Command } from '../utils/commands';
import { SlashCommandBuilder } from 'discord.js';
import { shrimpleGifs } from '../modules/gifs';
import { getRandom } from '../utils/misc';


export default {
    data: new SlashCommandBuilder()
        .setName('shrimple')
        .setDescription('Show how shrimple (or clampicated) something is.'),

    async execute(interaction) {
        await interaction.reply(getRandom(shrimpleGifs));
    }
} satisfies Command;

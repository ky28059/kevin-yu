import type { Command } from '../utils/commands';
import { SlashCommandBuilder } from 'discord.js';
import { wooperGifs } from '../modules/gifs';
import { getRandom } from '../utils/misc';


export default {
    data: new SlashCommandBuilder()
        .setName('woop')
        .setDescription('Woop woop!'),

    async execute(interaction) {
        await interaction.reply(getRandom(wooperGifs));
    }
} satisfies Command;

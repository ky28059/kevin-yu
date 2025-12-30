import type { Command } from '../utils/commands';
import { SlashCommandBuilder } from 'discord.js';
import { otterGifs } from '../modules/gifs';
import { getRandom } from '../utils/misc';


export default {
    data: new SlashCommandBuilder()
        .setName('otter')
        .setDescription('Man...'),

    async execute(interaction) {
        await interaction.reply(getRandom(otterGifs));
    }
} satisfies Command;

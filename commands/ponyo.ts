import type { Command } from '../utils/commands';
import { SlashCommandBuilder } from 'discord.js';
import { ponyoGifs } from '../modules/gifs';
import { getRandom } from '../utils/misc';


export default {
    data: new SlashCommandBuilder()
        .setName('ponyo')
        .setDescription('Ponyo loves Sosuke!'),

    async execute(interaction) {
        await interaction.reply(getRandom(ponyoGifs));
    }
} satisfies Command;

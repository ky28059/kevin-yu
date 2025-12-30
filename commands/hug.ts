import type { Command } from '../utils/commands';
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { hugGifs } from '../modules/gifs';
import { getRandom } from '../utils/misc';


export default {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Send a hug gif!')
        .addIntegerOption(option => option
            .setName('num')
            .setDescription('The hug gif to send. If not specified, this is randomized!')),

    async execute(interaction) {
        const num = interaction.options.getInteger('num');
        if (num && (num >= hugGifs.length || num < 0)) return void await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Invalid index! Keep indexes between \`[0, ${hugGifs.length - 1}]\`.`)
                    .setColor(0xf6b40c)
            ],
            flags: MessageFlags.Ephemeral
        });

        await interaction.reply(getRandom(hugGifs, num));
    }
} satisfies Command;

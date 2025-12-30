import type { Command } from '../utils/commands';
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

// Utils
import { getBirthdays } from '../modules/birthdays';
import { chunked } from '../utils/misc';
import { paginate } from '../utils/embeds';


export default {
    data: new SlashCommandBuilder()
        .setName('birthdays')
        .setDescription('Gets upcoming birthdays in the current server.'),

    async execute(interaction) {
        const members = interaction.guild?.members.cache.values();
        const ids = members
            ? new Set([...members].map(m => m.id))
            : new Set<string>()

        // Simple heuristic to determine if birthdays are banned
        const birthdays = getBirthdays(ids);
        if (ids.size > 100 || birthdays.length / ids.size <= 0.1) {
            const failEmbed = new EmbedBuilder().setDescription('Birthdays are disabled in public servers.');
            return void await interaction.reply({ embeds: [failEmbed], flags: MessageFlags.Ephemeral });
        }

        const pages = chunked(birthdays, 20).map((c, i) => {
            const desc = c
                .map((d, j) => `${i * 20 + j + 1}. <@${d.userId}> on <t:${d.date.valueOf() / 1000}:D> <t:${d.date.valueOf() / 1000}:R>`)
                .join('\n')
                || '*No birthdays known for the current server!*'

            return new EmbedBuilder()
                .setTitle(interaction.guild
                    ? `Upcoming ${interaction.guild.name} birthdays  🎉`
                    : 'Upcoming birthdays  🎉')
                .setColor(0xf6b40c)
                .setDescription(desc)
                .setFooter({ text: 'If any of the above dates are wrong, please let me know!' })
        })

        await paginate(interaction, pages);
    }
} satisfies Command;

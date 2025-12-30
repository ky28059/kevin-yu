import type { Command } from '../utils/commands';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getBirthdays } from '../modules/birthdays';


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
            return void await interaction.reply({ embeds: [failEmbed], ephemeral: true });
        }

        const desc = birthdays
            .map((d, i) => `${i + 1}. <@${d.userId}> on <t:${d.date.valueOf() / 1000}:D> <t:${d.date.valueOf() / 1000}:R>`)
            .join('\n')
            || '*No birthdays known for the current server!*'

        const birthdayEmbed = new EmbedBuilder()
            .setTitle(interaction.guild
                ? `Upcoming ${interaction.guild.name} birthdays  🎉`
                : 'Upcoming birthdays  🎉')
            .setColor(0xf6b40c)
            .setDescription(desc)
            .setFooter({ text: 'If any of the above dates are wrong, please let me know!' })

        await interaction.reply({ embeds: [birthdayEmbed] })
    }
} satisfies Command;

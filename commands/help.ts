import type { Command } from '../utils/commands';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ethanRegex, perkashRegex } from '../bot';


export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Helps you understand.'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('kevin yu.')
            .setColor(0xf6b40c)
            .setDescription('It is I! ~~Dio~~ Kevin Yu! This bot occasionally does things. Ping <@355534246439419904> if it breaks.')

        if (interaction.guildId === '859197712426729532') helpEmbed.addFields(
            { name: 'maya automated perkash', value: `All messages matched in the form of \`maya [...] perkash\` will update the <#956055434173751306> description accordingly. For the curious, the regex used is \`${perkashRegex}\`.` },
            { name: 'server name shuffling', value: 'Every 24 hours, the server name is shuffled randomly between the cool people of this server 🥰. Get the status of the refresh loop with `/status` and immediately trigger a refresh with `/refresh`.' }
        );

        if (interaction.guildId === '617085013531295774') helpEmbed.addFields(
            { name: 'ethan gads!', value: `Kevin Yu will prefix "ethan" to allowed e-words. For the curious, the regex used is: \`\`\`\n${ethanRegex}\n\`\`\`` }
        );

        helpEmbed.addFields(
            { name: 'wooper wednesday', value: 'A weekly celebration of wooper wednesday, as one is wont to observe. You can also use `/woop` to celebrate early!' },
            { name: '🐱 theory', value: 'Use `c.c` to start a category theory guessing game! (parodying [SciOlyID](https://sciolyid.org/about/)\'s bird identification bot)' },
            { name: '🫂', value: 'Use `/hug` to send a random hug gif :D', inline: true },
            { name: '🦐', value: 'Use `/shrimple` to show how shrimple (or clampicated) something is.', inline: true },
            { name: '🦦', value: 'Use `/otter` to send a random otter gif 🦦', inline: true }
        );

        await interaction.reply({ embeds: [helpEmbed] });
    }
} satisfies Command;

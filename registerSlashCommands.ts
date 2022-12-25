import {SlashCommandBuilder} from '@discordjs/builders';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {token} from './auth';


const globalCommands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Helps you understand.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Send a hug gif!')
        .addIntegerOption(option => option
            .setName('num')
            .setDescription('The hug gif to send. If not specified, this is randomized!'))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('woop')
        .setDescription('Woop woop!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('ponyo')
        .setDescription('Ponyo loves Sosuke!')
        .toJSON()
];

const serverCommands = [
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Gets the status of the server name refresh loop.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Immediately refreshes the server name.')
        .toJSON()
]

const clientId = '973385182566580344';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Register global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: globalCommands }
        );

        // Register server specific commands
        await rest.put(
            Routes.applicationGuildCommands(clientId, '859197712426729532'),
            { body: serverCommands }
        );

        console.log('Successfully reloaded application and guild (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

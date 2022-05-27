import {SlashCommandBuilder} from '@discordjs/builders';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {token} from './auth';


const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Helps you understand.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Gets the status of the server name refresh loop.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Immediately refreshes the server name.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Send a hug!')
        .addIntegerOption(option => option
            .setName('num')
            .setDescription('The hug gif to send. If not specified, this is randomized!'))
        .toJSON()
];

const clientId = '973385182566580344';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

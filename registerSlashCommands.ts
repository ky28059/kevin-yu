import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import { thisFishServers, token } from './config';


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
        .toJSON(),
    new SlashCommandBuilder()
        .setName('shrimple')
        .setDescription('Show how shrimple (or clampicated) something is.')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('otter')
        .setDescription('Man...')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('birthdays')
        .setDescription('Gets upcoming birthdays in the current server.')
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

const thisFishCommand = new SlashCommandBuilder()
    .setName('this-fish')
    .setDescription('Repost this fish')
    .toJSON()

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

        // Register this fish in the allowed servers
        for (const server of thisFishServers) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, server),
                { body: [thisFishCommand] }
            )
        }

        console.log('Successfully reloaded application and guild (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import { thisFishServers, token } from './config';
import commands from './commands';


const thisFishCommand = new SlashCommandBuilder()
    .setName('this-fish')
    .setDescription('Repost this fish')
    .toJSON()

const clientId = '973385182566580344';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        const globalCommands = commands.map(c => c.data);

        console.log('Started refreshing application (/) commands.');

        // Register global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: globalCommands }
        );

        // Register server specific commands
        // await rest.put(
        //     Routes.applicationGuildCommands(clientId, '859197712426729532'),
        //     { body: serverCommands }
        // );

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

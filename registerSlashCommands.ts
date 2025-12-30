import { REST, Routes } from 'discord.js';
import { token } from './config';
import commands from './commands';


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

        console.log('Successfully reloaded application and guild (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

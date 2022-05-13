import {Client, MessageEmbed, TextChannel} from 'discord.js';
import {readdirSync} from 'fs';
import {token} from './auth';


const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_PRESENCES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS",
    ],
    presence: {activities: [{type: 'WATCHING', name: 'y\'all 🥰'}]},
    allowedMentions: {repliedUser: false}
});

type ServerStatusInfo = {
    lastRunTimestamp: number,
    name: string,
    iconName: string,
    iconNumber: number,
    totalIcons: number,
}
let statusInfo: ServerStatusInfo;

let updateInterval: NodeJS.Timeout;
const updateTime = 1000 * 60 * 60 * 24;


// Randomizes the server name and icon
async function updateServerName() {
    const names = [
        'victor dang', 'angeline hu', 'roger fan', 'maya chill perkash',
        'leo yao', 'alexander liu', 'chinyoung shao'
    ];
    const name = names[Math.floor(Math.random() * names.length)];

    // Set the guild name and random icon
    const guild = client.guilds.cache.get('859197712426729532');
    if (!guild) return;
    const icons = readdirSync(`./icons/${name}`);
    const iconIndex = Math.floor(Math.random() * icons.length);

    await guild.setName(name);
    await guild.setIcon(`./icons/${name}/${icons[iconIndex]}`);

    statusInfo = {
        lastRunTimestamp: Date.now(),
        name,
        iconName: icons[iconIndex],
        iconNumber: iconIndex + 1,
        totalIcons: icons.length
    }
}

// Formats the current server status info for display in commands
function formatStatusInfo() {
    const {name, iconName, iconNumber, totalIcons} = statusInfo;
    return `**${name}**, using icon \`${iconName}\` (${iconNumber}/${totalIcons})`;
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Update the server name immediately and on an interval specified by `updateTime`
    await updateServerName();
    updateInterval = setInterval(updateServerName, updateTime);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === 'DM') return;

    // Update #chill-perkash channel description automatically
    const match = message.content.match(/^maya "?(.+)"? perkash$/i)?.[1]?.replaceAll('"', '\'');
    if (match) {
        const channel = client.channels.cache.get('956055434173751306');
        if (!channel || !(channel instanceof TextChannel)) return;

        const desc = channel.topic?.match(/maya (.+) perkash/i)?.[1];
        await channel.setTopic(desc ? `maya ${desc} "${match}" perkash` : `maya "${match}" perkash`);
        await message.reply('noted.');
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'help') {
        const helpEmbed = new MessageEmbed()
            .setTitle('kevin yu.')
            .setColor(0xf6b40c)
            .setDescription('It is I! ~~Dio~~ Kevin Yu! This bot occasionally does things. Ping <@355534246439419904> if it breaks.')
            .addField('maya automated perkash', 'All messages matched in the form of `maya [...] perkash` will update the <#956055434173751306> description accordingly. For the curious, the regex used is `/^maya "?(.+)"? perkash$/i`.')
            .addField('server name shuffling', 'Every 24 hours, the server name is shuffled randomly between the cool people of this server 🥰')

        await interaction.reply({embeds: [helpEmbed]});
    }

    if (interaction.commandName === 'status') {
        const lastRunDiscordTimestamp = Math.floor(statusInfo.lastRunTimestamp / 1000);
        const nextRunDiscordTimestamp = Math.floor((statusInfo.lastRunTimestamp + updateTime) / 1000);

        const statusEmbed = new MessageEmbed()
            .setTitle('Server name status')
            .setColor(0xf6b40c)
            .setDescription(`The server name is currently ${formatStatusInfo()}.\n\nThe server was last updated on <t:${lastRunDiscordTimestamp}>. The next update is scheduled for <t:${nextRunDiscordTimestamp}>, <t:${nextRunDiscordTimestamp}:R>.`)

        await interaction.reply({embeds: [statusEmbed]});
    }
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);

import {ActivityType, ChannelType, Client, EmbedBuilder, TextChannel} from 'discord.js';
import {CronJob} from 'cron';
import {readdirSync} from 'fs';
import {getHugGif, maxIndex} from './hugs';
import {token} from './auth';


const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildPresences",
        "GuildMembers",
        "GuildMessageReactions",
        "MessageContent"
    ],
    presence: {activities: [{type: ActivityType.Watching, name: 'y\'all 🥰'}]},
    allowedMentions: {repliedUser: false}
});

type ServerStatusInfo = {
    name: string,
    iconName: string,
    iconNumber: number,
    totalIcons: number,
}
let statusInfo: ServerStatusInfo;

let serverUpdateJob: CronJob;
let wooperWednesdayJob: CronJob;


// Randomizes the server name and icon
async function updateServerName() {
    // Parse names from subdirectories of `./icons`
    const names = readdirSync('./icons', {withFileTypes: true})
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);
    const name = names[Math.floor(Math.random() * names.length)];

    // Set the guild name and random icon
    const guild = client.guilds.cache.get('859197712426729532');
    if (!guild) return;
    const icons = readdirSync(`./icons/${name}`);
    const iconIndex = Math.floor(Math.random() * icons.length);

    await guild.setName(name);
    await guild.setIcon(`./icons/${name}/${icons[iconIndex]}`);

    statusInfo = {
        name,
        iconName: icons[iconIndex],
        iconNumber: iconIndex + 1,
        totalIcons: icons.length
    }
}

// Reminds everyone that it is wooper wednesday!
async function sendWooperWednesday() {
    const channels = ['859197712426729535', '928554105323016195'];

    for (const id of channels) {
        const channel = client.channels.cache.get(id);
        if (!channel || !(channel instanceof TextChannel)) continue;
        await channel.send('https://tenor.com/view/wooper-wednesday-wooper-wednesday-pokemon-gif-21444101');
    }
}

// Formats the current server status info for display in commands
function formatStatusInfo() {
    const {name, iconName, iconNumber, totalIcons} = statusInfo;
    return `**${name}**, using icon \`${iconName}\` (${iconNumber}/${totalIcons})`;
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Start the server update and wooper wednesday cron jobs
    serverUpdateJob = new CronJob({
        cronTime: '0 0 * * *',
        onTick: updateServerName,
        start: true,
        timeZone: 'America/Los_Angeles',
        runOnInit: true
    });
    wooperWednesdayJob = new CronJob({
        cronTime: '0 0 * * Wed',
        onTick: sendWooperWednesday,
        start: true,
        timeZone: 'America/Los_Angeles'
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;

    // Update #chill-perkash channel description automatically
    const match = message.content.match(/^maya "?(.+)"? perkash$/i)?.[1]?.replaceAll('"', '\'');
    if (match && message.guildId === '859197712426729532') {
        const channel = client.channels.cache.get('956055434173751306');
        if (!channel || !(channel instanceof TextChannel)) return;

        const desc = channel.topic?.match(/maya (.+) perkash/i)?.[1];
        await channel.setTopic(desc ? `maya ${desc} "${match}" perkash` : `maya "${match}" perkash`);
        await message.reply('noted.');
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('kevin yu.')
            .setColor(0xf6b40c)
            .setDescription('It is I! ~~Dio~~ Kevin Yu! This bot occasionally does things. Ping <@355534246439419904> if it breaks.')

        if (interaction.guildId === '859197712426729532') helpEmbed.addFields(
            {name: 'maya automated perkash', value: 'All messages matched in the form of `maya [...] perkash` will update the <#956055434173751306> description accordingly. For the curious, the regex used is `/^maya "?(.+)"? perkash$/i`.'},
            {name: 'server name shuffling', value: 'Every 24 hours, the server name is shuffled randomly between the cool people of this server 🥰. Get the status of the refresh loop with `/status` and immediately trigger a refresh with `/refresh`.'}
        );

        helpEmbed.addFields(
            {name: 'wooper wednesday', value: 'A weekly celebration of wooper wednesday, as one is wont to observe. You can also use `/woop` to celebrate early!'},
            {name: '🫂', value: 'Use `/hug` to send a random hug gif :D'}
        );

        await interaction.reply({embeds: [helpEmbed]});
    } else if (interaction.commandName === 'status') {
        const lastRunTimestamp = Math.floor(serverUpdateJob.lastDate().valueOf() / 1000);
        const nextRunTimestamp = Math.floor(serverUpdateJob.nextDate().valueOf() / 1000);

        const statusEmbed = new EmbedBuilder()
            .setTitle('Server name status')
            .setColor(0xf6b40c)
            .setDescription(`The server name is currently ${formatStatusInfo()}.\n\nThe server was last updated on <t:${lastRunTimestamp}>. The next update is scheduled for <t:${nextRunTimestamp}>, <t:${nextRunTimestamp}:R>.`)

        await interaction.reply({embeds: [statusEmbed]});
    } else if (interaction.commandName === 'refresh') {
        await updateServerName();

        const successEmbed = new EmbedBuilder()
            .setTitle('Refresh successful!')
            .setColor(0xf6b40c)
            .setDescription(`The server name is now ${formatStatusInfo()}. The next update is scheduled <t:${Math.floor(serverUpdateJob.nextDate().valueOf() / 1000)}:R>.`)
            .setFooter({text: 'To avoid rate limits, it is recommended to refrain from calling this command again in the next 5 minutes.'})

        await interaction.reply({embeds: [successEmbed]});
    } else if (interaction.commandName === 'hug') {
        const num = interaction.options.getInteger('num');
        if (num && (num > maxIndex || num < 0)) return void await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({name: `Invalid index! Keep indexes between [0, ${maxIndex}].`})
                    .setColor(0xf6b40c)
            ]
        });
        await interaction.reply(getHugGif(num));
    } else if (interaction.commandName === 'woop') {
        const woops = [
            'https://tenor.com/view/wooper-wednesday-wooper-wednesday-pokemon-gif-21444101',
            'https://tenor.com/view/wooper-pokemon-woop-woop-wooper-ethnostate-gif-21864770',
            'https://tenor.com/view/wooper-pokemon-wooper-ethnostate-woop-woop-gif-21864763',
            'https://tenor.com/view/marx-2219-meme-wow-yes-gif-22915194',
            'https://tenor.com/view/pokemon-surprise-fall-oops-that-one-friend-gif-11722586',
            'https://tenor.com/view/wooper-pokemon-gif-25055346',
            'https://tenor.com/view/wooper-my-beloved-pokemon-heart-woop-woop-gif-20666113',
            'https://tenor.com/view/wooper-pokemon-smile-quagsire-gif-20667095',
            'https://tenor.com/view/mudkip-pokemon-gif-24125499',
            'https://tenor.com/view/wooper-pokemon-gif-25059358',
            'https://tenor.com/view/wooper-pokemon-pichu-gif-22614879',
            'https://tenor.com/view/wooper-swimming-gif-22100413',
            'https://tenor.com/view/wooper-pokemon-gif-25058363',
            'https://tenor.com/view/wooper-gif-25140763'
        ]
        await interaction.reply(woops[Math.floor(Math.random() * woops.length)]);
    }
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);

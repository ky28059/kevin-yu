import {ActivityType, Client, EmbedBuilder, TextChannel} from 'discord.js';
import {CronJob} from 'cron';
import {readdirSync} from 'fs';
import {getGif, truncate} from './util';
import {hugGifs, ponyoGifs, wooperGifs} from './gifs';
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
    const channels = ['859197712426729535', '928554105323016195', '617085014001319984'];

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
    if (!message.inGuild()) return;

    // Update #chill-perkash channel description automatically
    if (message.guild.id === '859197712426729532') {
        const desc = message.content.match(/^maya "?(.+)"? perkash$/i)?.[1]?.replaceAll('"', '\'');
        if (!desc) return;

        const channel = client.channels.cache.get('956055434173751306');
        if (!channel || !(channel instanceof TextChannel)) return;

        const oldDesc = channel.topic?.match(/maya (.+) perkash/i)?.[1];
        await channel.setTopic(oldDesc ? `maya ${oldDesc} "${desc}" perkash` : `maya "${desc}" perkash`);
        await message.reply('noted.');
    }

    // Update Saumya's nickname automatically
    if (message.guild.id === '928554105323016192' && message.author.id === '632281409134002195') {
        const nick = message.content.match(/\bI(?:['’]?|\s+a)m\s+(.+)/i)?.[1];
        if (!nick) return;

        const member = message.guild.members.cache.get('632281409134002195');
        if (!member) return;

        await member.setNickname(truncate(nick, 32));
    }

    // Prefix `ethan` to allowed e-words (and variations)
    // Allowed words: esports, ecommerce, emoji/emote/emoticon/emotion, edating, econ, enormous, egregious, evade,
    // eject, edragon, ebarbs, egads, egirl
    if (message.guild.id === '617085013531295774') {
        const match = message.content.match(/\be(sports?|commerce|mo(?:ji|te|ticon|tion(?:ally)?)s?|dat(?:es?|ing)|con(?:omic(?:s|al(?:ly)?)?)?|norm(?:ous(?:ly)?|ity)|gregious(?:ly)?|va(?:de[sd]?|sions?)|ject(?:ed|ion|ing)?s?|drag(?:on)?s?|barb(?:arian)?s?|gads|girls?)\b/i)
        if (!match) return;

        await message.reply(`ethan ${match[1]}`)
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
        if (num && (num >= hugGifs.length || num < 0)) return void await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({name: `Invalid index! Keep indexes between [0, ${hugGifs.length - 1}].`})
                    .setColor(0xf6b40c)
            ]
        });
        await interaction.reply(getGif(hugGifs, num));
    } else if (interaction.commandName === 'woop') {
        await interaction.reply(getGif(wooperGifs));
    } else if (interaction.commandName === 'ponyo') {
        await interaction.reply(getGif(ponyoGifs));
    }
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

void client.login(token);

import { ActivityType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';
import { readdirSync } from 'fs';

// Utils
import { hugGifs, otterGifs, ponyoGifs, shrimpleGifs, thisFishGifs, wooperGifs } from './modules/gifs';
import { gameChannels, questions, runSingleQuestion } from './modules/games';
import { getBirthdays, getNextBirthday } from './modules/birthdays';
import { generateRandomAnimalOutcome } from './modules/linda';
import { generateRandomEmojiString, getRandom, truncate } from './util';

// Config
import { birthdays, thisFishServers, timeZone, token, wooperChannels } from './config';


const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildPresences",
        "GuildMembers",
        "GuildMessageReactions",
        "MessageContent"
    ],
    presence: { activities: [{ type: ActivityType.Watching, name: 'y\'all 🥰' }] },
    allowedMentions: { repliedUser: false }
});

type ServerStatusInfo = {
    name: string,
    iconName: string,
    iconNumber: number,
    totalIcons: number,
}
let statusInfo: ServerStatusInfo;

let killNeil = false;

let serverUpdateJob: CronJob<null, null>;
let wooperWednesdayJob: CronJob<null, null>;
let endWooperWednesdayJob: CronJob<null, null>;
let postThisCatJob: CronJob<null, null>;
let birthdayJob: CronJob<null, null>;


// Randomizes the server name and icon
async function updateServerName() {
    // Parse names from subdirectories of `./icons`
    const names = readdirSync('./icons', { withFileTypes: true })
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
    for (const id of wooperChannels) {
        const channel = client.channels.cache.get(id);
        if (!channel?.isSendable()) continue;
        await channel.send('https://tenor.com/view/wooper-wednesday-wooper-wednesday-pokemon-gif-21444101');
    }
}

async function endWooperWednesday() {
    for (const id of wooperChannels) {
        const channel = client.channels.cache.get(id);
        if (!channel?.isSendable()) continue;
        await channel.send('https://tenor.com/view/wooper-gif-27280303');
    }
}

async function postThisCat() {
    for (const id of wooperChannels) {
        const channel = client.channels.cache.get(id);
        if (!channel?.isSendable()) continue;
        await channel.send('https://tenor.com/view/cat-kitty-pussycat-feline-gif-26001328');
    }
}

async function checkBirthdays() {
    const today = DateTime.now().setZone(timeZone).startOf('day');

    // Check every birthday to see if it occurs today
    for (const b of birthdays) {
        const nextDate = getNextBirthday(b.date, today);
        if (today.valueOf() !== nextDate.valueOf()) continue;

        for (const id of b.channelIds) {
            const channel = client.channels.cache.get(id);
            if (!channel?.isSendable()) continue;
            await channel.send(`<@${b.userId}>  ${generateRandomEmojiString(['🔥', '🥳', '🍰', '🎉'], 4, 6)}`);
        }
    }
}

// Formats the current server status info for display in commands
function formatStatusInfo() {
    const { name, iconName, iconNumber, totalIcons } = statusInfo;
    return `**${name}**, using icon \`${iconName}\` (${iconNumber}/${totalIcons})`;
}

// Allowed words: esports, egads, eventful, ecommerce, emoji/emote/emoticon/emotion, edating, egirl, econ, enum,
// elite, erase, eraser, epoch, enumerate, enormous, egregious, eventual, evade, eject, edragon, ebarbs
// Removed patterns: mail(?:s|ed|ing)?, vents?
const ethanRegex = /\be(sports?|gads|ventful|commerce|mo(?:ji|te|ticon|tion(?:ally)?)s?|dat(?:e[sd]?|ing)|girls?|con(?:omic(?:s|al(?:ly)?)?)?|nums?|lit(?:e|ist)s?|ras(?:e[sd]?|ing)|rasers?|pochs?|numera(?:t(?:e[sd]?|ing)|ble)|norm(?:ous(?:ly)?|ity)|gregious(?:ly)?|ventual(?:ly)?|va(?:de[sd]?|sions?)|ject(?:ed|ion|ing)?s?|drag(?:on)?s?|barb(?:arian)?s?)\b/i
const perkashRegex = /^maya "?(.+)"? perkash$/i

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Start the server update and wooper wednesday cron jobs
    serverUpdateJob = CronJob.from({
        cronTime: '0 0 0 * * *',
        onTick: updateServerName,
        start: true,
        timeZone,
        runOnInit: true
    });
    wooperWednesdayJob = CronJob.from({
        cronTime: '0 0 0 * * Wed',
        onTick: sendWooperWednesday,
        start: true,
        timeZone
    });
    endWooperWednesdayJob = CronJob.from({
        cronTime: '0 0 0 * * Thu',
        onTick: endWooperWednesday,
        start: true,
        timeZone
    });
    postThisCatJob = CronJob.from({
        cronTime: '0 0 0 19 * *',
        onTick: postThisCat,
        start: true,
        timeZone
    });
    birthdayJob = CronJob.from({
        cronTime: '0 0 0 * * *',
        onTick: checkBirthdays,
        start: true,
        timeZone
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    // Kill neil for his crimes
    if (killNeil && message.author.id === '221731072822607872' && message.deletable)
        return void await message.delete();

    // Category theory game
    if (message.content === 'c.c' && !gameChannels.has(message.channel.id))
        return runSingleQuestion(message, getRandom(questions));

    const ethanMatch = message.content.match(ethanRegex);
    const perkashDesc = message.content.match(perkashRegex)?.[1]?.replaceAll('"', '\'');
    const perkashChannel = client.channels.cache.get('956055434173751306');

    // Update Saumya's nickname automatically
    if (message.guild.id === '928554105323016192' && message.author.id === '632281409134002195') {
        const nick = message.content.match(/\bI(?:['’]?|\s+a)m\s+(.+)/i)?.[1];
        const member = message.guild.members.cache.get('632281409134002195');

        if (nick) await member?.setNickname(truncate(nick, 32));
    }

    if (message.guild.id === '859197712426729532' && perkashDesc && perkashChannel instanceof TextChannel) {
        // Update #chill-perkash channel description automatically
        const oldDesc = perkashChannel.topic?.match(/maya (.+) perkash/i)?.[1];
        await perkashChannel.setTopic(oldDesc ? `maya ${oldDesc} "${perkashDesc}" perkash` : `maya "${perkashDesc}" perkash`);
        await message.reply('noted.');
    } else if (message.guild.id === '617085013531295774' && ethanMatch) {
        // Prefix `ethan` to allowed e-words (and variations)
        await message.reply(`> ethan ${ethanMatch[1]}`);
    } else if (message.author.id === '355534246439419904' && message.content === '<@973385182566580344> kill neil') {
        killNeil = true;
        await message.react('👍');
    } else if (message.author.id === '355534246439419904' && message.content === '<@973385182566580344> stop killing neil') {
        killNeil = false;
        await message.react('👍');
    } else if (thisFishServers.includes(message.guild.id) && message.content.includes('this fish')) {
        // Repost this fish
        await message.reply(getRandom(thisFishGifs));
    } else if (message.guild.id === '1335666560420937740' && message.author.id === '533836540166799360' && message.content.match(/i(?:t'?)?s ok/i)) {
        // Discourage linda from self-dep
        await message.reply(generateRandomAnimalOutcome());
    } else if (message.mentions.parsedUsers.has(client.user!.id)) {
        // Random response to ping
        const p = Math.random() * 100;

        if (p >= 97) {
            message.channel.send('wrong person silly 🦦');
        } else if (p >= 92) {
            message.channel.send(getRandom(otterGifs));
        } else if (p >= 87) {
            message.channel.send(getRandom(ponyoGifs));
        } else if (p >= 82) {
            message.channel.send(getRandom(wooperGifs));
        } else if (p >= 81) {
            message.channel.send('love my fans <3');
        } else if (p >= 78) {
            message.channel.send('on cod ⁉️');
        } else if (p >= 75) {
            message.channel.send('‼️');
        } else if (p >= 73) {
            message.channel.send('https://wiki.haskell.org/All_About_Monads');
        } else if (p >= 71) {
            message.channel.send('https://github.com/SVWEFSBRWHWBCOTSEID/game-website');
        } else if (p >= 68) {
            message.channel.send('zoull');
        } else if (p >= 66) {
            message.channel.send('https://en.wikipedia.org/wiki/Duff%27s_device');
        } else if (p >= 64) {
            message.channel.send('https://tenor.com/view/curse-of-ra-curse-of-ra-gif-10622361558915339590');
        } else if (p >= 62) {
            message.channel.send('erm... what the jingles');
        } else if (p >= 59) {
            message.channel.send('bark like a dog');
        } else if (p >= 56) {
            message.channel.send('nor way 🇳🇴');
        } else if (p >= 53) {
            message.channel.send('https://tenor.com/view/skull-gif-23663947');
        } else if (p >= 50) {
            message.channel.send('reel 🎣');
        } else if (p >= 47) {
            message.channel.send(`<@${client.user!.id}>`);
        } else {
            const emotes = [
                '🥰', '<:blobheart:912101944808583198>', '<:blobcosyandcomfy:912101890085503047>',
                '<:blobhug:1173729381823287326>', '<:blobsalute:912101922192900136>', '<:blobreach:912101908355891210>'
            ];
            message.channel.send(generateRandomEmojiString(emotes));
        }
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
    } else if (interaction.commandName === 'status') {
        const lastRunTimestamp = Math.floor(serverUpdateJob.lastDate()!.valueOf() / 1000);
        const nextRunTimestamp = Math.floor(serverUpdateJob.nextDate().valueOf() / 1000);

        const statusEmbed = new EmbedBuilder()
            .setTitle('Server name status')
            .setColor(0xf6b40c)
            .setDescription(`The server name is currently ${formatStatusInfo()}.\n\nThe server was last updated on <t:${lastRunTimestamp}>. The next update is scheduled for <t:${nextRunTimestamp}>, <t:${nextRunTimestamp}:R>.`)

        await interaction.reply({ embeds: [statusEmbed] });
    } else if (interaction.commandName === 'refresh') {
        await updateServerName();

        const successEmbed = new EmbedBuilder()
            .setTitle('Refresh successful!')
            .setColor(0xf6b40c)
            .setDescription(`The server name is now ${formatStatusInfo()}. The next update is scheduled <t:${Math.floor(serverUpdateJob.nextDate().valueOf() / 1000)}:R>.`)
            .setFooter({ text: 'To avoid rate limits, it is recommended to refrain from calling this command again in the next 5 minutes.' })

        await interaction.reply({ embeds: [successEmbed] });
    } else if (interaction.commandName === 'hug') {
        const num = interaction.options.getInteger('num');
        if (num && (num >= hugGifs.length || num < 0)) return void await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Invalid index! Keep indexes between [0, ${hugGifs.length - 1}].` })
                    .setColor(0xf6b40c)
            ]
        });
        await interaction.reply(getRandom(hugGifs, num));
    } else if (interaction.commandName === 'woop') {
        await interaction.reply(getRandom(wooperGifs));
    } else if (interaction.commandName === 'ponyo') {
        await interaction.reply(getRandom(ponyoGifs));
    } else if (interaction.commandName === 'shrimple') {
        await interaction.reply(getRandom(shrimpleGifs));
    } else if (interaction.commandName === 'otter') {
        await interaction.reply(getRandom(otterGifs));
    } else if (interaction.commandName === 'this-fish') {
        await interaction.reply(getRandom(thisFishGifs));
    } else if (interaction.commandName === 'birthdays') {
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
});

client.on('messageDelete', async (message) => {
    if (!message.author) return;
    if (message.author.bot) return;
    if (message.guildId !== '1335666560420937740') return;

    const logChannel = client.channels.cache.get('1341632462341804103');
    if (!logChannel?.isSendable()) return;

    const deletedEmbed = new EmbedBuilder()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
        .setDescription(`**Message in ${message.channel} was deleted:**\n${message.content}`)
        .setTimestamp()
        .setColor(0xb50300)
        .setFooter({ text: 'Deleted message' });

    await logChannel.send({ embeds: [deletedEmbed] });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!oldMessage.author) return;
    if (oldMessage.author.bot) return;
    if (oldMessage.guildId !== '1335666560420937740') return;

    const logChannel = client.channels.cache.get('1341632462341804103');
    if (!logChannel?.isSendable()) return;

    // Prevent logs for messages whose content hasn't changed
    if (oldMessage.content === newMessage.content) return;

    const desc = `**Message in ${oldMessage.channel} was edited:** [Jump to message](${newMessage.url})`;
    const fields = [
        { name: 'Before:', value: truncate((oldMessage.content ?? '*[Partial message]*') || '*[Empty message]*', 1024) },
        { name: 'After:', value: truncate((newMessage.content ?? '*[Partial message]*') || '*[Empty message]*', 1024) }
    ];

    const deletedEmbed = new EmbedBuilder()
        .setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL() })
        .setDescription(desc)
        .addFields(fields)
        .setTimestamp()
        .setColor(0xed7501)
        .setFooter({ text: 'Edited message' });

    await logChannel.send({ embeds: [deletedEmbed] });
});

client.on('warn', info => console.warn(info));
client.on('error', error => console.error(error));

void client.login(token);

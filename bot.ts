import { ActivityType, Client, Collection, EmbedBuilder, TextChannel } from 'discord.js';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';

// Utils
import type { Command, CommandGroup } from './utils/commands';
import { otterGifs, ponyoGifs, wooperGifs } from './modules/gifs';
import { gameChannels, questions, runSingleQuestion } from './modules/games';
import { getNextBirthday } from './modules/birthdays';
import { generateRandomAnimalOutcome } from './modules/linda';
import { generateRandomEmojiString, getRandom, truncate } from './utils/misc';
import commands from './commands';

// Config
import { birthdays, timeZone, token, wooperChannels } from './config';


declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command | CommandGroup>;
    }
}

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

client.commands = new Collection();
for (const command of commands) {
    console.log(`Loaded /${command.data.name}`);
    client.commands.set(command.data.name, command);
}

type ServerStatusInfo = {
    name: string,
    iconName: string,
    iconNumber: number,
    totalIcons: number,
}
let statusInfo: ServerStatusInfo;

let killNeil = false;

let wooperWednesdayJob: CronJob<null, null>;
let endWooperWednesdayJob: CronJob<null, null>;
let postThisCatJob: CronJob<null, null>;
let birthdayJob: CronJob<null, null>;


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

// Allowed words: esports, egads, eventful, ecommerce, emoji/emote/emoticon/emotion, edating, egirl, econ, enum,
// elite, erase, eraser, epoch, enumerate, enormous, egregious, eventual, evade, eject, edragon, ebarbs
// Removed patterns: mail(?:s|ed|ing)?, vents?
export const ethanRegex = /\be(sports?|gads|ventful|commerce|mo(?:ji|te|ticon|tion(?:ally)?)s?|dat(?:e[sd]?|ing)|girls?|con(?:omic(?:s|al(?:ly)?)?)?|nums?|lit(?:e|ist)s?|ras(?:e[sd]?|ing)|rasers?|pochs?|numera(?:t(?:e[sd]?|ing)|ble)|norm(?:ous(?:ly)?|ity)|gregious(?:ly)?|ventual(?:ly)?|va(?:de[sd]?|sions?)|ject(?:ed|ion|ing)?s?|drag(?:on)?s?|barb(?:arian)?s?)\b/i
export const perkashRegex = /^maya "?(.+)"? perkash$/i

client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Start the wooper wednesday cron jobs
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

    const raw = client.commands.get(interaction.commandName);
    if (!raw) return;

    const command = 'commands' in raw
        ? raw.commands[interaction.options.getSubcommand()]
        : raw
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch {
        // TODO: log
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

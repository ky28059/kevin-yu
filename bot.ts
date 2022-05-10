import {Client, MessageEmbed, TextChannel} from 'discord.js';
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

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Update the server name every 24 hours
    setInterval(() => {
        const names = [
            'victor dang', 'angeline hu', 'roger fan', 'maya chill perkash',
            'leo yao', 'alexander liu', 'chinyoung shao'
        ];
        const name = names[Math.floor(Math.random() * names.length)];
        client.guilds.cache.get('859197712426729532')?.setName(name);
    }, 1000 * 60 * 60 * 24);
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
});

// Error handling
client.on('warn', info => console.log(info));
client.on('error', error => console.error(error));

client.login(token);

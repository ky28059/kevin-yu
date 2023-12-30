import {AttachmentBuilder, Message} from 'discord.js';
import {readFileSync} from 'fs';


export const questions: QuestionInfo[] = [{
    name: 'cone',
    sources: ['1.png'],
    href: 'https://en.wikipedia.org/wiki/Cone_(category_theory)'
}, {
    name: 'cocone',
    sources: ['2.png'],
    href: 'https://en.wikipedia.org/wiki/Cone_(category_theory)'
}, {
    name: 'natural transformation',
    sources: ['3.png'],
    href: 'https://en.wikipedia.org/wiki/Natural_transformation'
}, {
    name: 'monad',
    sources: ['5.png', '14.png'],
    href: 'https://en.wikipedia.org/wiki/Monad_(category_theory)'
}, {
    name: 'monoid',
    sources: ['15.png', '16.png'],
    href: 'https://en.wikipedia.org/wiki/Monoid'
}, {
    name: 'state monad',
    sources: ['6.png', '7.png'],
    href: 'https://en.wikipedia.org/wiki/Monad_(category_theory)#The_state_monad'
}, {
    name: 'maybe monad',
    sources: ['8.png', '9.png', '12.png'],
    href: 'https://en.wikipedia.org/wiki/Monad_(category_theory)#The_maybe_monad'
}, {
    name: 'list monad',
    sources: ['13.png'],
    href: 'https://wiki.haskell.org/All_About_Monads#The_List_monad'
}, {
    name: 'pushout',
    sources: ['10.png'],
    href: 'https://en.wikipedia.org/wiki/Pushout_(category_theory)'
}, {
    name: 'pullback',
    sources: ['11.png'],
    href: 'https://en.wikipedia.org/wiki/Pullback_(category_theory)'
}]

type QuestionInfo = {
    name: string,
    sources: string[],
    href: string
}

export const gameChannels = new Set<string>();

export function runSingleQuestion(message: Message, data: QuestionInfo) {
    gameChannels.add(message.channel.id);
    const shuffled = shuffle(data.sources);
    let i = 0;

    const attachment = new AttachmentBuilder(readFileSync(`./assets/${shuffled[i]}`));
    message.channel.send({files: [attachment]});

    const filter = (m: Message) => m.content.startsWith('c.');
    const collector = message.channel.createMessageCollector({filter, time: 15000});
    let guessStatus = Guess.TIMEOUT;

    collector.on('collect', (m) => {
        // Request hint
        if (m.content === 'c.h')
            return void message.channel.send(`The first letter is ${data.name[0].toUpperCase()}`);

        // New picture
        if (m.content === 'c.c') {
            if (++i >= shuffled.length) return void message.channel.send('*There are no more pictures of this item.*');

            const attachment = new AttachmentBuilder(readFileSync(`./assets/${shuffled[i]}`));
            return void message.channel.send({files: [attachment]});
        }

        // Skip
        if (m.content === 'c.sk' || m.content === 'c.skip') {
            guessStatus = Guess.SKIPPED;
            collector.stop();
        }

        // Guess
        if (m.content.startsWith('c.g')) {
            const guess = m.content.slice(3).trim();
            guessStatus = guess.toLowerCase() === data.name.toLowerCase()
                ? Guess.CORRECT
                : Guess.INCORRECT
            collector.stop();
        }
    });
    collector.on('end', () => {
        const statusMsg = guessStatus === Guess.CORRECT ? 'Correct! Good job!'
            : guessStatus === Guess.INCORRECT ? 'Incorrect.'
            : guessStatus === Guess.SKIPPED ? 'Question skipped.'
            : 'Question timed out.'
        message.channel.send(`${statusMsg} The category theory concept was **${data.name}**.\n${data.href}`);
        gameChannels.delete(message.channel.id);
    });
}

enum Guess {
    CORRECT, INCORRECT, TIMEOUT, SKIPPED
}

// https://stackoverflow.com/a/12646864
function shuffle<T>(array: T[]) {
    const ret = [...array];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = ret[i];
        ret[i] = ret[j];
        ret[j] = temp;
    }
    return ret;
}

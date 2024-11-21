# kevin yu
 literally me.

https://discord.com/oauth2/authorize?client_id=973385182566580344&scope=bot+applications.commands&permissions=8

To run, create a `config.ts` exporting your discord token and channel / server configs:
```ts
import type { BirthdayInfo } from './modules/birthdays';
import { DateTime } from 'luxon';


export const timeZone = 'America/Indiana/Indianapolis';
export const token = 'real-discord-token-trust';

export const wooperChannels = [
    '...'
];

export const thisFishServers = [
    '...'
];

export const birthdays: BirthdayInfo[] = [
    {
        userId: '...',
        channelIds: ['...', ...],
        date: DateTime.fromISO('...', { zone: timeZone })
    },
    ...
];
```
Run
```bash
npm run registerSlashCommands
```
to update slash commands and
```bash
npm start
```
to start the bot.

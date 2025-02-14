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

### Running on a Raspberry Pi
When installing `node` on Raspbian, note that the node version included with `apt install nodejs` is v12.22.9; the current LTS version as of writing is v22.14.0. To
get a more modern version, you'll have to use [`nvm`](https://github.com/nvm-sh/nvm), e.g.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source "$HOME/.nvm/nvm.sh"
nvm install 22
```
Then, to ensure the bot runs once per system startup, set up a crontab via
```bash
crontab -e
```
that looks something like:
```crontab
PATH=/home/ky28059/.nvm/versions/node/v22.13.1/bin:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

@reboot (sleep 15; cd /home/ky28059/kevin-yu && npm start) >> /home/ky28059/kevin-yu.log
```
(make sure to include the `PATH` extension that lets the crontab user access the newly installed `node` / `npm` binaries).

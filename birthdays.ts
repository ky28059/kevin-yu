import { DateTime } from 'luxon';
import { birthdays } from './config';


export type BirthdayInfo = {
    userId: string,
    channelIds: string[],
    date: DateTime
}

export function getBirthdayInfo(ids: Set<string>) {
    const filtered = ids.size === 0
        ? birthdays
        : birthdays.filter(d => ids.has(d.userId))

    return filtered
        .map((d, i) => `${i + 1}. <@${d.userId}>`)
        .join('\n')
        || '*No birthdays known for the current server!*'
}

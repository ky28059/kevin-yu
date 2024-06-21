import { DateTime } from 'luxon';
import { birthdays } from './config';


export type BirthdayInfo = {
    userId: string,
    channelIds: string[],
    date: DateTime
}

export function getNextBirthday(date: DateTime, now: DateTime) {
    return (date.month < now.month) || (date.month === now.month && date.day < now.day)
        ? DateTime.local(now.year + 1, date.month, date.day)
        : DateTime.local(now.year, date.month, date.day)
}

export function getBirthdayInfo(ids: Set<string>) {
    const filtered = ids.size === 0
        ? birthdays
        : birthdays.filter(d => ids.has(d.userId))

    const now = DateTime.now();
    return filtered
        .map(b => ({ ...b, date: getNextBirthday(b.date, now) })) // Map birthdays to their next occurrence
        .sort((a, b) => a.date.valueOf() - b.date.valueOf())
        .map((d, i) => `${i + 1}. <@${d.userId}> on <t:${d.date.valueOf() / 1000}:D> <t:${d.date.valueOf() / 1000}:R>`)
        .join('\n')
        || '*No birthdays known for the current server!*'
}

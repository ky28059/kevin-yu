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

    const now = DateTime.now();
    const upcoming = filtered.map(b => {
        const nextDate = (b.date.month < now.month) || (b.date.month === now.month && b.date.day < now.day)
            ? DateTime.local(now.year + 1, b.date.month, b.date.day)
            : DateTime.local(now.year, b.date.month, b.date.day)

        return { ...b, date: nextDate };
    });

    return upcoming
        .sort((a, b) => a.date.valueOf() - b.date.valueOf())
        .map((d, i) => `${i + 1}. <@${d.userId}> on <t:${d.date.valueOf() / 1000}:D> <t:${d.date.valueOf() / 1000}:R>`)
        .join('\n')
        || '*No birthdays known for the current server!*'
}

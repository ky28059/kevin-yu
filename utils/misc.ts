export function truncate(str: string, len: number) {
    if (str.length <= len) return str;
    return str.slice(0, len - 3).trimEnd() + '...';
}

export function chunked<T>(arr: T[], size: number) {
    return arr.reduce((res: T[][], item, index) => {
        const chunkIndex = Math.floor(index / size);
        if (!res[chunkIndex]) res[chunkIndex] = [];

        res[chunkIndex].push(item);
        return res;
    }, []);
}

// Gets the specified element from an array, or a random one if no number is supplied.
export function getRandom<T>(arr: T[], num?: number | null) {
    const index = num ?? Math.floor(Math.random() * arr.length);
    return arr[index];
}

export function generateRandomEmojiString(emotes: string[], min: number = 2, max: number = 7) {
    let msg = '';

    // Generate emote chain of length: [min, max]
    let remaining = min + Math.floor(Math.random() * (max - min + 1));
    for (let i = 0; i < emotes.length && remaining > 0; i++) {
        const count = i === emotes.length - 1
            ? remaining
            : Math.floor(Math.random() * Math.min(remaining + 1, 4)); // [0, min(remaining, 3)]

        msg += (emotes[i] + ' ').repeat(count);
        remaining -= count;
    }

    return msg;
}

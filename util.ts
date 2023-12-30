export function truncate(str: string, len: number) {
    if (str.length <= len) return str;
    return str.slice(0, len - 3).trimEnd() + '...';
}

// Gets the specified element from an array, or a random one if no number is supplied.
export function getRandom<T>(arr: T[], num?: number | null) {
    const index = num ?? Math.floor(Math.random() * arr.length);
    return arr[index];
}

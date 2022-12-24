export function truncate(str: string, len: number) {
    if (str.length <= len) return str;
    return str.slice(0, len - 3).trimEnd() + '...';
}

// Gets the specified gif from a collection of gifs, or a random one if no number is supplied.
export function getGif(gifs: string[], num?: number | null) {
    const index = num ?? Math.floor(Math.random() * gifs.length);
    return gifs[index];
}

export const escapeRegExp = (string : string) : string => {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export const regexp = (string : string) : RegExp => {
    return new RegExp(string, 'i');
}
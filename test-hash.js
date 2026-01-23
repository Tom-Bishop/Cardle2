function hashCode(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash;
}

const carCount = 444;
const dates = ['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23'];

dates.forEach(date => {
    const hash = hashCode(date);
    const index = Math.abs(hash) % carCount;
    console.log(`${date}: hash=${hash}, index=${index}`);
});

import { getRandom } from '../utils/misc';

const land = [
    'baby giraffes',
    'baby elephants',
    'wildebeest',
]

const landOutcomes = [
    'gunned down by poachers in the African safari',
    'trampled to death by bison',
    'feasted on by hyenas',
    'torn to shreds by lions',
    'picked clean by vultures'
]

const birds = [
    'bluejays',
    'doves',
    'swallows',
    'seagulls'
]

const birdOutcomes = [
    'baked into a pie',
    'shredded to pieces by a Boeing 737 turbofan engine',
    'devoured by red-tailed hawks',
    'choked to death by factory smog'
]

const aquatic = [
    'blue whales',
    'dolphins',
    'beluga whales',
]

const aquaticOutcomes = [
    'harpooned by whalers off the coast of Japan',
    'mauled by orcas off the coast of Greenland',
]

const other = [
    ['baby seals', 'clubbed to death by fur traders in the bleak, Arctic north'],
    ['butterflies', 'torched by flamethrowers']
]

export function generateRandomAnimalOutcome() {
    const count = Math.floor(Math.random() * 25) + 2;
    let animal;
    let outcome;

    const p = Math.random() * 100;
    if (p >= 75) {
        animal = getRandom(land);
        outcome = getRandom(landOutcomes);
    } else if (p >= 50) {
        animal = getRandom(birds);
        outcome = getRandom(birdOutcomes);
    } else if (p >= 25) {
        animal = getRandom(aquatic);
        outcome = getRandom(aquaticOutcomes);
    } else {
        [animal, outcome] = getRandom(other);
    }

    return `${count} ${animal} were just ${outcome}.`;
}

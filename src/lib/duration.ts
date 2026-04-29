export function parseDuration(duration: string) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = duration.match(regex);

    if (!match) {
        return null;
    }
    const [, rawAmount, unit] = match;
    const amount = parseInt(rawAmount, 10);
    if (Number.isNaN(amount)) {
        console.log("number is nan", amount);
        return null;
    }

    if (!isUnit(unit)) {
        console.log("unit doesn't match", amount);
        return null;
    }

    console.log({
        rawAmount,
        unit,
        amount,
        units: Object.keys(unitToMultiplier),
        isUnit: isUnit(unit),
    });

    const result = amount * unitToMultiplier[unit]();
    console.log(result)
    return result;
}

function isUnit(s: string): s is Unit {
    return Object.keys(unitToMultiplier).includes(s);
}

type Unit = keyof typeof unitToMultiplier;

const unitToMultiplier = {
    ms: () => 1,
    s: () => 1000 * unitToMultiplier.ms(),
    m: () => 60 * unitToMultiplier.s(),
    h: () => 60 * unitToMultiplier.m(),
} as const;

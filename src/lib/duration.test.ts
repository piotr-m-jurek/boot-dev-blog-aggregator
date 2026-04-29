import { describe, expect, test } from "vitest";
import { parseDuration } from "./duration";

describe("duration", () => {
    test.each([
        ["asdf", null],
        ["-5m", null],
        ["1m", 60000],
        ["5s", 5000],
        ["1ms", 1],
        ["1h", 3600000],
    ])("String %0 is equal to '%1' miliseconds", (duration, expected) =>
        void expect(parseDuration(duration)).toEqual(expected));
});

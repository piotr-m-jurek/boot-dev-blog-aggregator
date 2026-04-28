import { XMLParser } from "fast-xml-parser";
import { z } from "zod/v4";
import { assertNever } from "./lib/assertNever";

const RSSItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    guid: z.string(),
    pubDate: z.string(),
});

export const FeedItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    link: z.string(),
    updated: z.string(),
    summary: z.string(),
});

const RSSChannelSchema = z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    language: z.string(),
    item: z.union([z.array(z.any()), z.record(z.string(), z.any())]),
});

export const RSSSchema = z.union([
    z.object({
        "?xml": z.string(),
        rss: z.object({ channel: RSSChannelSchema }),
    }),
    z.object({
        "?xml": z.string(),
        feed: z.object({ entry: RSSChannelSchema }),
    }),
]);

type FeedItem = {
    title: string;
    link: string;
    desciption: string;
    pubDate: string;
};

type Feed = {
    title: string;
    description: string;
    link: string;
    items: FeedItem[];
};
export async function fetchFeed(feedURL: string): Promise<Feed> {
    const parser = new XMLParser({ processEntities: false });
    const res = await fetch(feedURL, { headers: { "User-Agent": "gator" } });
    const raw = await res.text();
    const xml = await parser.parse(raw);
    const json = RSSSchema.safeParse(xml);
    if (!json.success) {
        throw new Error("No channel present in RSS feed");
    }

    if ("rss" in json.data) {
        const rawItems = Array.isArray(json.data.rss.channel.item)
            ? json.data.rss.channel.item
            : Object.values(json.data.rss.channel.item);

        const items = rawItems.flatMap((rawItem) => {
            const item = RSSItemSchema.safeParse(rawItem);
            if (!item.success) {
                return [];
            }

            return [
                {
                    title: item.data.title,
                    link: item.data.link,
                    desciption: item.data.description,
                    pubDate: item.data.pubDate,
                },
            ];
        });
        return {
            title: json.data.rss.channel.title,
            description: json.data.rss.channel.description,
            link: json.data.rss.channel.link,
            items,
        };
    }
    if ("feed" in json.data) {
        const rawItems = Array.isArray(json.data.feed.entry.item)
            ? json.data.feed.entry.item
            : Object.values(json.data.feed.entry.item);

        const items = rawItems.flatMap((rawItem) => {
            const item = FeedItemSchema.safeParse(rawItem);
            if (!item.success) {
                return [];
            }

            return [
                {
                    title: item.data.title,
                    link: item.data.link,
                    desciption: item.data.summary,
                    pubDate: item.data.updated,
                },
            ];
        });
        return {
            title: json.data.feed.entry.title,
            description: json.data.feed.entry.description,
            link: json.data.feed.entry.link,
            items,
        };
    }
    assertNever(json.data);
}

import { XMLParser } from "fast-xml-parser";
import { z } from "zod/v4";

const RSSItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    guid: z.string(),
    pubDate: z.string(),
});

const RSSChannelSchema = z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    language: z.string(),
    item: z.union([z.array(z.any()), z.record(z.string(), z.any())]),
});

export const RSSSchema = z.object({
    "?xml": z.string(),
    rss: z.discriminatedUnion("type", [
        z.object({
            type: "channel",
            channel: RSSChannelSchema,
        }),
        z.object({
            type: "channel",
            channel: RSSChannelSchema,
        }),
    ]),
});

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
    console.log(xml);
    const json = RSSSchema.safeParse(xml);
    if (!json.success) {
        throw new Error("No channel present in RSS feed");
    }

    const rawItems = Array.isArray(json.data.rss.channel.item)
        ? json.data.rss.channel.item
        : Object.values(json.data.rss.channel.item);

    const items = rawItems.flatMap((rawItem) => {
        const item = RSSItemSchema.safeParse(rawItem);
        console.log("parsedItem:\n", item);
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

fetchFeed("https://radekmie.dev/atom.xml");

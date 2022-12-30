
import { htmlToText } from "html-to-text";
import fetch from "node-fetch";
import { Anime } from './Anime.js'
import { GetFileExtension, GetMimeType, isEmpty, LogToPublic, ShortError } from "./../utils.js";

export class AnimeHandler {
    #max_Page = 10;
    #max_PerPage = 49;
    #APIs = {
        Random:
        {
            Chance: 6,
            Type: "A",
            Api: () => { return "https://api.consumet.org/meta/anilist/random-anime" }
        },
        Popular:
        {
            Chance: 2,
            Type: "B",
            Api: (p, perP) => { return `https://api.consumet.org/meta/anilist/popular?page=${Math.ceil((Math.random() * p))}&perPage=${perP}` }
        },
        Trending:
        {
            Chance: 2,
            Type: "B",
            Api: (p, perP) => { return `https://api.consumet.org/meta/anilist/trending?page=${Math.ceil((Math.random() * p))}&perPage=${perP}` }
        },
    };

    #malUrl = "https://myanimelist.net/anime/";

    constructor() {
    }

    /**
     * Asynchronously returns anime data from available APIs
     * @returns {Anime} anime data as Anime class
     */
    async RandomAnimeAsync() {
        let status;
        let apiResponse;
        let api_data = this.#GetRandomApi();
        let { page, select_numb } = this.#randPage();

        const fetch_fnThen = (rs) => { apiResponse = rs; }
        const fetch_fnCatch = (err) => {
            console.log(`RandomAnime Fetch Error: ${ShortError(err, 300)}`);
            LogToPublic(`RandomAnime Fetch Error: ${ShortError(err, 300)}`);
            return false;
        }
        switch (api_data.Type) {
            case "B":
                await fetch(api_data.Api(page, this.#max_PerPage)).then(fetch_fnThen).catch(fetch_fnCatch);
                break;
            case "A":
                await fetch(api_data.Api()).then(fetch_fnThen).catch(fetch_fnCatch);
                break;
        }
        status = apiResponse.status;
        if (isEmpty(apiResponse) || status != 200) {
            let r = await apiResponse.text();
            console.log(`RandomAnime Error: api response is empty or is down. ${r}`);
            LogToPublic(`RandomAnime Error: api response is empty or is down. ${r}`);
            return { r, status };
        }
        let jsonRS = await apiResponse.text();

        let rawData = JSON.parse(jsonRS);

        rawData = (
            api_data.Type == "B"
        ) ? rawData.results[select_numb] : rawData;

        let anime = this.#ProcessAnimeApiResponse(rawData);
        return { anime, status };

    }
    /**
    * @returns api: { Chance: number; Type: string; Api: () => string; }
    */
    #GetRandomApi() {
        let _APIs = Object.values(this.#APIs);
        let selectionPot = [];
        _APIs.forEach(api => {
            for (let i = 0; i < api.Chance; i++) {
                selectionPot.push(api);
            }
        });
        return selectionPot[Math.ceil(Math.random() * selectionPot.length - 1)];
    }
    #randPage() {
        let p, pp;
        p = Math.ceil(Math.random() * (this.#max_Page - 1));
        pp = Math.ceil(Math.random() * (this.#max_PerPage - 1));
        return { page: p, select_numb: pp };
    }

    #ProcessAnimeApiResponse(raw) {

        if (isEmpty(raw)) return false;

        let image = raw.image || raw.cover
        let ext = GetFileExtension(image);
        let desc = htmlToText(raw.description, { preserveNewlines: true });
        let mimetyp = GetMimeType(ext || 'image/jpeg');

        desc.replaceAll("\n\n\n\n", "\n\n").replaceAll("\n\n\n", "\n\n");

        let anime_data = new Anime();
        anime_data = {
            isAdult: raw.isAdult,
            id: raw.id,
            image: image,
            ext: ext,
            mimetype: mimetyp,
            mal_link: this.#malUrl.concat(raw.malId),
            t_romaji: raw.title.romaji || "",
            t_english: raw.title.english || "",
            t_native: raw.title.native || "",
            status: raw.status || "",
            type: raw.type || "",
            releaseDate: raw.releaseDate || raw.releasedDate || "",
            totalEpisodes: raw.totalEpisodes || "",
            genres: raw.genres,
            desc: desc || "",
            rating: raw.rating || "",
            duration: raw.duration || ""
        }
        return anime_data;
    }
}
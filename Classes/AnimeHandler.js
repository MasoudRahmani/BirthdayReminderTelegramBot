
import { htmlToText } from "html-to-text";
import fetch from "node-fetch";
import { Anime } from './Anime.js'
import { GetFileExtension, GetMimeType, isEmpty, LogToPublic, ShortError } from "./../utils.js";

export class AnimeHandler {
    #APIs = {
        Random: () => { return "https://api.consumet.org/meta/anilist/random-anime" },
        Popular: () => { return `https://api.consumet.org/meta/anilist/popular?page=${Math.ceil((Math.random() * 5))}&perPage=1` },
        Trending: () => { return `https://api.consumet.org/meta/anilist/trending?page=${Math.ceil((Math.random() * 5))}&perPage=1` }
    };
    #malUrl = "https://myanimelist.net/anime/";

    constructor() {
    }
    /**
     * Asynchronously returns anime data from available APIs
     * @returns {Anime} anime data as Anime class
     */
    async RandomAnimeAsync() {
        let apiResponse;
        let api = this.#GetRandomApi();

        await fetch(api()).then(rs => {
            apiResponse = rs;
        }).catch(err => {
            console.log(`RandomAnime Fetch Error: ${ShortError(err, 200)}`);
            LogToPublic(`RandomAnime Fetch Error: ${ShortError(err, 200)}`);
            return false;
        });
        if (isEmpty(apiResponse)) {
            console.log(`RandomAnime Error: api response is empty.`);
            LogToPublic(`RandomAnime Error: api response is empty.`);
            return false;
        }
        let jsonRS = await apiResponse.text();

        return this.#ProcessAnimeApiResponse(jsonRS, api);

    }
    #ProcessAnimeApiResponse(response, api) {
        let raw = JSON.parse(response);

        raw = (
            api == this.#APIs.Popular ||
            api == this.#APIs.Trending
        ) ? raw.results[0] : raw;

        if (isEmpty(raw)) return false;

        let image = raw.image || raw.cover
        let ext = GetFileExtension(image);
        let desc = htmlToText(raw.description, { preserveNewlines: true });
        let mimetyp = GetMimeType(ext || 'image/jpeg');

        let anime_data = new Anime();
        anime_data = {
            isAdult: raw.isAdult,
            id: raw.id,
            image: image,
            ext: ext,
            mimetype: mimetyp,
            mal_link: this.#malUrl.concat(raw.malId),
            t_romaji: raw.title.romaji,
            t_english: raw.title.english,
            t_native: raw.title.native,
            status: raw.status,
            type: raw.type,
            releaseDate: raw.releaseDate || raw.releasedDate,
            totalEpisodes: raw.totalEpisodes,
            genres: raw.genres,
            desc: desc,
            rating: raw.rating,
            duration: raw.duration
        }
        return anime_data;
    }

    #GetRandomApi() {
        let _APIfn = Object.values(this.#APIs);
        return _APIfn[Math.ceil(Math.random() * _APIfn.length - 1)];
    }

}
export class Anime {
    constructor(isAdult,
        id,
        image,
        ext,
        mimetype,
        mal_link,
        t_romaji,
        t_english,
        t_native,
        status,
        type,
        releaseDate,
        totalEpisodes,
        genres,
        desc,
        rating,
        duration) {
        this.isAdult = isAdult || '';
        this.id = id || '';
        this.image = image || '';
        this.ext = ext || '';
        this.mimetype = mimetype || '';
        this.mal_link = mal_link || '';
        this.t_romaji = t_romaji || '';
        this.t_english = t_english || '';
        this.t_native = t_native || '';
        this.status = status || '';
        this.type = type || '';
        this.releaseDate = releaseDate || '';
        this.totalEpisodes = totalEpisodes || '';
        this.genres = genres || '';
        this.desc = desc || '';
        this.rating = rating || '';
        this.duration = duration || '';
    }
}

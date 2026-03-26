export interface Cover {
	id: number;
	image_id: string;
	width: number;
	height: number;
}

export interface Genre {
	id: number;
	name: string;
	slug: string;
}

export interface Platform {
	id: number;
	name: string;
	slug: string;
	abbreviation: string;
}

export interface Company {
	id: number;
	name: string;
	description: string;
	country: number;
	slug: string;
}

export interface InvolvedCompany {
	id: number;
	company: Company;
	developer: boolean;
	publisher: boolean;
}

export interface Game {
	id: number;
	name: string;
	slug: string;
	summary: string;
	storyline: string;
	rating: number;
	rating_count: number;
	aggregated_rating: number;
	aggregated_rating_count: number;
	first_release_date: number;
	cover: Cover;
	genres: Genre[];
	platforms: Platform[];
	involved_companies: InvolvedCompany[];
	similar_games: Game[];
	url: string;
	status: number;
	category: number;
}

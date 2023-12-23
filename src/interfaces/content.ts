export enum Job {
  Actor = 'actor',
  Director = 'director',
  Writer = 'writer',
  Creator = 'creator',
}

export enum Media {
  Movie = 'movie',
  Tv = 'tv',
}

export enum PictureType {
  Logo = 'logo',
  Poster = 'poster',
  Backdrop = 'backdrop',
  Thumbnail = 'thumbnail',
}

export enum Platform {
  Netflix = 'netflix',
  Disney = 'disney',
  Canal = 'canal',
  Paramount = 'paramount',
  Ocs = 'ocs',
  Crunchyroll = 'crunchyroll',
  Prime = 'prime',
}

export interface TitleFile {
  fr: string;
  en: string;
  original: string;
}

export interface Title {
  fr?: string;
  en?: string;
}

export interface Overview {
  fr?: string;
  en?: string;
}

export interface Rating {
  source: string;
  score: number;
}

export interface Picture {
  type: PictureType;
  fr: string | null;
  en: string | null;
  // original: string;
  notitle: string | null;
}

export interface Cast {
  name: string;
  job: Job;
  character_role?: string | null;
  profile_path: string | null;
  priority?: number;
}

export interface Link {
  platform: Platform;
  link: string;
  available: boolean;
  // channel: string | null;
}

export interface EpisodeFile {
  id_episode_limbr: string;
  label_saison: string;
  number: number;
  title: Title;
  poster: Picture;
  runtime: number;
  overview: Overview;
  links: Link[];
}

export interface EpisodeSQL {
  episode_id: string;
  saison: string;
  number?: number;
  title: Title;
  titles_episode_id?: string;
  titles_fr?: string;
  titles_en?: string;
  pictures: Picture[];
  runtime: number | null;
  overview: Overview;
  overviews_fr?: string;
  overviews_en?: string;
  links: Link[];
}

export interface Episode {
  episode_id: string;
  saison: string;
  number?: number;
  title: Title;
  pictures: Picture[];
  runtime: number | null;
  overview: Overview;
  links: Link[];
}

export interface ContentFile {
  id_limbr: number;
  media: Media;
  title: TitleFile;
  release_date: string;
  age_certification: string | null;
  genres: string[];
  runtime: number | null;
  overview: Overview;
  rating: Rating[];
  poster: Picture;
  backdrop: Picture;
  trailer: string;
  cast: Cast[];
  director: Cast[];
  writer: Cast[];
  creator: Cast[];
  keywords: string[];
  budget: number;
  revenue: number;
  links: Link[];
  logo: Picture;
  episode_details?: EpisodeFile[];
}

export interface ContentSQL {
  content_id: number;
  media: Media;
  title: Title;
  titles_episode_id?: string;
  titles_fr?: string;
  titles_en?: string;
  country?: string | null;
  release_date: string;
  age_certification: string | null;
  genres: string[];
  runtime: number | null;
  overview: Overview;
  overviews_fr?: string;
  overviews_en?: string;
  trailer: string;
  budget?: number;
  revenue?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Content {
  content_id: number;
  media: Media;
  title: Title;
  country?: string | null;
  release_date: string;
  age_certification: string | null;
  genres: string[];
  runtime: number | null;
  overview: Overview;
  ratings: Rating[];
  pictures: Picture[];
  trailer: string;
  casts: Cast[];
  keywords: string;
  budget: number;
  revenue: number;
  links: Link[];
  episodes?: Episode[] | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ContentSearch {
  research?: string;
  medias?: string;
  genres?: string;
  countries?: string;
  release_dates?: string;
  notes?: string;
  platforms?: string;
  page?: string;
  ids?: string;
}

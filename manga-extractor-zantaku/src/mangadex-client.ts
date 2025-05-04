import axios, { AxiosInstance } from 'axios';

interface MangaResult {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  status?: string;
  lastChapter?: number;
}

class MangaDexClient {
  private api: AxiosInstance;
  private authToken?: string;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.mangadex.org/',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.api.post('/auth/login', {
      username,
      password
    });
    this.authToken = response.data.token.session;
    this.api.defaults.headers.Authorization = `Bearer ${this.authToken}`;
  }

  async searchManga(query: string, limit: number = 20): Promise<MangaResult[]> {
    const response = await this.api.get('/manga', {
      params: {
        title: query,
        limit,
        includes: ['cover_art']
      }
    });

    return response.data.data.map((manga: any) => ({
      id: manga.id,
      title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
      description: manga.attributes.description?.en,
      coverUrl: this.getCoverUrl(manga.relationships),
      status: manga.attributes.status,
      lastChapter: manga.attributes.lastChapter
    }));
  }

  private getCoverUrl(relationships: any[]): string | undefined {
    const cover = relationships.find(r => r.type === 'cover_art');
    return cover ? `https://uploads.mangadex.org/covers/${cover.id}` : undefined;
  }

  async getMangaDetails(mangaId: string): Promise<any> {
    const [mangaResponse, chaptersResponse] = await Promise.all([
      this.api.get(`/manga/${mangaId}`),
      this.api.get(`/manga/${mangaId}/feed`, {
        params: {
          limit: 500,
          translatedLanguage: ['en']
        }
      })
    ]);

    return {
      metadata: mangaResponse.data.data,
      chapters: chaptersResponse.data.data
    };
  }

  async getChapterPages(chapterId: string): Promise<string[]> {
    const response = await this.api.get(`/at-home/server/${chapterId}`);
    return response.data.chapter.data.map((page: string) =>
      `${response.data.baseUrl}/data/${response.data.chapter.hash}/${page}`
    );
  }
}

export default MangaDexClient;


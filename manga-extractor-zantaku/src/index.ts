import MangaDexClient from './mangadex-client';

(async () => {
  const md = new MangaDexClient();

  // Search for manga
  const results = await md.searchManga('berserk');
  console.log('Search Results:', results);

  // Get manga details
  if (results.length > 0) {
    const details = await md.getMangaDetails(results[0].id);
    console.log('Manga Details:', details);

    // Get chapter pages
    if (details.chapters.length > 0) {
      const pages = await md.getChapterPages(details.chapters[0].id);
      console.log('Chapter Pages:', pages);
    }
  }
})();


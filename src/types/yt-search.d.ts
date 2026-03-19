declare module 'yt-search' {
  type Video = {
    title: string;
    url: string;
  };

  type SearchResult = {
    videos: Video[];
  };

  function search(query: string): Promise<SearchResult>;

  export default search;
}

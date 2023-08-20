import axios from 'axios';

const BASE_URL = 'https://api.giphy.com/v1/gifs/search';
const API_KEY = 'kFyvwbasqHAi9voa2rKO1SygKrRjCquE';

export class GiphyAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 12;
    this.total = 0;
  }

  async fetchImages() {
    console.log(BASE_URL);
    const responce = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        q: this.searchQuery,
        offset: (this.page - 1) * this.per_page,
        // image_type: 'photo',
        // orientation: 'horizontal',
        // safesearch: 'true',
        limit: this.per_page,
      },
    });

    console.log(responce.data);

    this.total = responce.data.pagination.total_count;

    return responce.data.data.map(element => {
      return {
        small: `https://i.giphy.com/media/${element.id}/giphy.webp`,
        large: `https://i.giphy.com/media/${element.id}/giphy.webp`,
        description: element.title,
        filename: `${element.id}.webp`,
      };
    });
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  isMore() {
    return (this.page - 1) * this.per_page < this.total && this.page !== 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

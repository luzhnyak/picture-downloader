import axios from 'axios';

const BASE_URL = 'https://api.pexels.com/v1/search';
const API_KEY = 'Y9XQ4Q7ZwV6yIB0oPSHmZkzMd1ItP34WbNjOhElrk3kp56QgivTYdL75';

export class PexelsAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 12;
    this.total = 0;
  }

  async fetchImages() {
    const responce = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        query: this.searchQuery,
        page: this.page,
        // image_type: 'photo',
        // orientation: 'horizontal',
        // safesearch: 'true',
        per_page: this.per_page,
      },
      headers: { Authorization: API_KEY },
    });

    this.total = responce.data.total_results;

    return responce.data.photos.map(element => {
      return {
        small: element.src.large,
        large: element.src.original,
        description: element.alt,
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

import axios from 'axios';

const BASE_URL = 'https://api.unsplash.com/search/photos';
const API_KEY = 'w4hMCRg4X6hfdvU-24REJPwuISlJNKHfaFPw9DbY-kw';

export class UnsplashAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 12;
    this.total = 0;
  }

  async fetchImages() {
    const data = [];
    const responce = await axios.get(BASE_URL, {
      params: {
        client_id: API_KEY,
        query: this.searchQuery,
        page: this.page,
        // image_type: 'photo',
        // orientation: 'horizontal',
        // safesearch: 'true',
        per_page: this.per_page,
      },
    });

    this.total = responce.data.total;

    return responce.data.results.map(element => {
      const url = element.urls.full;
      const fname = url.split('/')[url.split('/').length - 1].split('?')[0];
      const exp = url.split('fm=')[1].split('&')[0];
      return {
        small: element.urls.small,
        large: element.urls.full,
        description: element.description,
        filename: `${fname}.${exp}`,
      };
    });

    // return responce.data;
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

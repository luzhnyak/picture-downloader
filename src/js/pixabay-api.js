import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '8383420-2fd3a74e6fa7f1c43c1b3aa8e';

export class ImagesAPIService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 40;
    this.totalHits = 0;
  }

  async fetchImages() {
    const responce = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: this.searchQuery,
        page: this.page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: this.per_page,
      },
    });

    this.totalHits = responce.data.totalHits;

    return responce.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  isMore() {
    return (this.page - 1) * this.per_page < this.totalHits && this.page !== 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}

import { PixabayAPIService } from './pixabay-api.js';
import { UnsplashAPIService } from './unsplash-api.js';
import { PexelsAPIService } from './pexels-api.js';

import { download } from './file-downloader.js';

import Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const btnMoreEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');
const btnDownloadEl = document.querySelector('.js-download');
const btnSelectAllEl = document.querySelector('.js-select-all');
const selectApiEl = document.querySelector('.js-select-api');

console.dir(selectApiEl);
console.dir(selectApiEl.value);

formEl.addEventListener('submit', onFormSubmit);
btnDownloadEl.addEventListener('click', onClickDownload);
btnSelectAllEl.addEventListener('click', onClickSelectAll);
selectApiEl.addEventListener('change', onChangeSelectAPI);

function onChangeSelectAPI(event) {
  if (event.target.value === 'pixabay') {
    imagesAPIService = new PixabayAPIService();
  } else if (event.target.value === 'unsplash') {
    imagesAPIService = new UnsplashAPIService();
  } else if (event.target.value === 'pexels') {
    imagesAPIService = new PexelsAPIService();
  }
}

let imagesAPIService = new PixabayAPIService();
let selectURLs = new Set();

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onMore, options);

Notiflix.Notify.init({
  position: 'right-bottom',
});

const lightbox = new SimpleLightbox('.photo-card a', {
  /* options */
  captions: true,
  captionsData: 'alt',
  captionSelector: 'img',
  captionPosition: 'bottom',
  captionDelay: 250,
});

function onMore(entries, observer) {
  entries.forEach(element => {
    if (element.isIntersecting) {
      if (!imagesAPIService.isMore()) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        observer.unobserve(btnMoreEl);
        return;
      }
      loadImages();
    }
  });
}

async function loadImages() {
  try {
    const images = await imagesAPIService.fetchImages();

    console.log(images);
    console.log(imagesAPIService.page);

    if (!imagesAPIService.total) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.1'
      );
      observer.unobserve(btnMoreEl);
      return;
    }

    if (imagesAPIService.page === 1 && imagesAPIService.totalHits !== 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${imagesAPIService.totalHits} images.`
      );
      if (imagesAPIService.total > imagesAPIService.per_page)
        observer.observe(btnMoreEl);
    }

    await createMarkupCard(images);

    imagesAPIService.incrementPage();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.2'
    );
    observer.unobserve(btnMoreEl);
  }
}

async function onFormSubmit(event) {
  event.preventDefault();
  if (!event.target.elements.searchQuery.value.trim()) {
    return;
  }
  observer.unobserve(btnMoreEl);
  Notiflix.Loading.standard('Loading data, please wait...');
  galleryEl.innerHTML = '';
  imagesAPIService.resetPage();
  imagesAPIService.query = event.target.elements.searchQuery.value;
  loadImages();
  Notiflix.Loading.remove();
}

function createMarkupCard(images) {
  const markupGallery = images
    .map(({ small, large, description }) => {
      return `<div class="photo-card">
  <a class="photo-link" href="${large}">
    <img class="photo-img" src="${small}" alt="${description}" loading="lazy" />
  </a>
  <div class="info">
  <label><input class="js-select" type="checkbox" data-url="${large}">Select</label> 
  </div>  
</div>`;
    })
    .join(' ');

  galleryEl.insertAdjacentHTML('beforeend', markupGallery);
  lightbox.refresh();
  const selectChecboxes = document.querySelectorAll('.js-select');
  selectChecboxes.forEach(el =>
    el.addEventListener('change', event => {
      select(event.target);
    })
  );
}

function select(element) {
  const url = element.dataset.url;
  if (element.checked) {
    selectURLs.add(url);
  } else {
    selectURLs.delete(url);
  }
}

function onClickDownload(event) {
  selectURLs.forEach(url => {
    const filename = url.split('/')[url.split('/').length - 1];
    download(url, filename);
  });
}

function onClickSelectAll() {
  const selectChecboxes = document.querySelectorAll('.js-select');
  selectChecboxes.forEach(element => {
    element.checked = true;
    select(element);
  });
}

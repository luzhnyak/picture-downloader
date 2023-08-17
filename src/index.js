import { ImagesAPIService } from './js/pixabay-api.js';
import Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const btnMoreEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

formEl.addEventListener('submit', onFormSubmit);
// btnMoreEl.addEventListener('click', onMore);

const imagesAPIService = new ImagesAPIService();

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

    console.log(imagesAPIService.page);

    if (!imagesAPIService.totalHits) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      observer.unobserve(btnMoreEl);
      return;
    }

    if (imagesAPIService.page === 1 && imagesAPIService.totalHits !== 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${imagesAPIService.totalHits} images.`
      );
      if (imagesAPIService.totalHits > imagesAPIService.per_page)
        observer.observe(btnMoreEl);
    }

    await createMarkupCard(images);

    imagesAPIService.incrementPage();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
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

function createMarkupCard({ hits }) {
  const markupGallery = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
  <a class="photo-link" href="${largeImageURL}">
    <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes </b>${likes}
    </p>
    <p class="info-item">
      <b>Views </b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div> 
  
</div>`;
      }
    )
    .join(' ');

  galleryEl.insertAdjacentHTML('beforeend', markupGallery);
  lightbox.refresh();
}

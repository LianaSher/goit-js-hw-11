import axios from 'axios';
import Notiflix from 'notiflix';
import toastr from 'toastr';
import Simplelightbox from 'simplelightbox';

import 'toastr/build/toastr.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: 'toast-bottom-full-width',
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
};

const MY_KEY = '32967431-2c53db117de8c0f5af1f13e74';

const BASE_URL = 'https://pixabay.com/api/';

let page = 1;

let inputValue = null;

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

formEl.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreClick);

function onFormSubmit(evt) {
  evt.preventDefault();
  loadMoreBtn.hidden = true;
  galleryEl.innerHTML = '';

  page = 1;
  inputValue = evt.target.elements.searchQuery.value;
  console.log(inputValue);
  fetchImages(inputValue, page)
    .then(allCardsMarkup)
    .then(markup => {
      if (markup !== '') {
        loadMoreBtn.hidden = false;
      }
      renderMarkup(markup);

      const lightbox = new Simplelightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
    });
}

async function fetchImages(inputValue, page) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${MY_KEY}&q=${inputValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );

    const imagesArr = response.data.hits;
    if (page !== 1 && page > response.data.totalHits / 40) {
      toastr.info("We're sorry, but you've reached the end of search results");
      loadMoreBtn.hidden = true;
    }
    if (page === 1 && response.data.totalHits > 0) {
      toastr.success(`Hooray! We found ${response.data.totalHits} images`);
    }
    if (imagesArr.length === 0 && page === 1) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.hidden = true;
    }

    return imagesArr;
  } catch (err) {
    console.log(err.message);
  }
}

function createCardMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  const markup = `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`;
  return markup;
}

function allCardsMarkup(arr) {
  const allCardsMarkup = arr
    .map(dataObj => {
      return createCardMarkup(dataObj);
    })
    .join('');

  return allCardsMarkup;
}

function renderMarkup(markup) {
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function onLoadMoreClick() {
  page += 1;

  fetchImages(inputValue, page).then(allCardsMarkup).then(renderMarkup);
}

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import errorIcon from './img/error-icon.svg';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const formEl = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalPages = 0;

formEl.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onFormSubmit(event) {
  event.preventDefault();

  const searchText = event.currentTarget.elements['search-text'].value.trim();

  if (!searchText) {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  query = searchText;
  page = 1;
  totalPages = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    if (data.hits.length === 0) {
      showError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      return;
    }

    totalPages = Math.ceil(data.totalHits / PER_PAGE);
    createGallery(data.hits);
    updateLoadMore();
  } catch (error) {
    showError(`Something went wrong: ${error.message}`);
  } finally {
    hideLoader();
    formEl.reset();
  }
}

async function onLoadMore() {
  page += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    createGallery(data.hits);
    scrollGallery();
    updateLoadMore();
  } catch (error) {
    page -= 1;
    showLoadMoreButton();
    showError(`Something went wrong: ${error.message}`);
  } finally {
    hideLoader();
  }
}

function updateLoadMore() {
  if (page < totalPages) {
    showLoadMoreButton();
    return;
  }

  hideLoadMoreButton();
  iziToast.info({
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
  });
}

function scrollGallery() {
  const firstCard = document.querySelector('.gallery-item');
  if (!firstCard) return;

  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}

function showError(message) {
  iziToast.error({
    message,
    position: 'topRight',
    theme: 'dark',
    backgroundColor: 'rgba(239, 64, 64, 1)',
    messageColor: '#fafafb',
    iconUrl: errorIcon,
    progressBarColor: '#b51b1b',
    maxWidth: 432,
  });
}

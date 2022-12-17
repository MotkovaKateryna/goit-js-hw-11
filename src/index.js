import './css/styles.css';
import Notiflix from 'notiflix';
import { fetchPictures } from './js/fetchPictures.js';
// import SimpleLightbox from 'simplelightbox';
// const DEBOUNCE_DELAY = 300;
const refs = {
  form: document.querySelector('.search-form'),
  galleryBox: document.querySelector('.gallery'),
  loadmoreBtn: document.querySelector('.load-more'),
};

let _page = 1;
let _per_page = 40;
let query = '';

refs.form.addEventListener('submit', onImageSearch);

//----
// async function handleSubmit(e) {
//   e.preventDefault();
//   observer.unobserve(refs.sentinel);
//   const form = e.currentTarget;
//   const searchQuery = form.elements.searchQuery.value.trim();
//   if (searchQuery === '') return;
//   if (searchQuery !== query) {
//     refs.gallery.innerHTML = '';
//     query = searchQuery;
//     _page = 1;
//   }
//----

async function onImageSearch(e) {
  e.preventDefault();
  const form = e.currentTarget;

  const inputValue = form.elements.searchQuery.value.trim();
  //   console.log(inputValue);
  if (inputValue === '') {
    Notiflix.Notify.info(
      'Enter in the field the words that describe the picture you want to find'
    );
  }
  if (inputValue !== query) {
    refs.galleryBox.innerHTML = '';
    query = inputValue;
    _page = 1;
  }

  await fetchPictures(query, _page, _per_page)
    .then(data => {
      if (data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        renderPicturesList(data.hits);
        console.log(data.hits);
      }
      return data;
    })
    .catch(err => err.message)
    .finally(console.log(inputValue));
}

const createPicture = ({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) => {
  return `
  <a class="gallery-link" href="${largeImageURL}">
<img class ="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy" />
<div class="info">
  <p class="info-item">
    <b>Likes: ${likes}</b>
  </p>
  <p class="info-item">
    <b>Views: ${views}</b>
  </p>
  <p class="info-item">
    <b>Comments: ${comments}</b>
  </p>
  <p class="info-item">
    <b>Downloads: ${downloads}</b>
  </p>
</div>
</a>`;
};

function renderPicturesList(items) {
  const markup = items.map(createPicture).join('');
  return refs.galleryBox.insertAdjacentHTML('beforeend', markup);
}

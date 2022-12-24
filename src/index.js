import { Notify } from 'notiflix';
import '../node_modules/modern-normalize/modern-normalize.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import { fetchImage } from './js/fetchPictures';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  searchBtn: document.querySelector('.search-btn'),
  body: document.body,
  sentinel: document.querySelector('.sentinel'),
  spinner: document.querySelector('.spinner-border'),
};

let _page = 1;
let _per_page = 40;
let query = '';

refs.form.addEventListener('submit', handleSubmit);

refs.spinner.classList.add('js-hidden');

const options = {
  rootMargin: '150px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onEntry, options);

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});
async function handleSubmit(e) {
  e.preventDefault();
  observer.unobserve(refs.sentinel);
  const form = e.currentTarget;
  const inputValue = form.elements.searchQuery.value.trim();

  if (inputValue === '') {
    return Notify.info(
      'Enter in the field the words that describe the picture you want to find'
    );
  }

  if (inputValue !== query) {
    refs.gallery.innerHTML = '';
    query = inputValue;
    _page = 1;
  }

  await fetchImage(query, _page, _per_page)
    .then(data => {
      if (data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
        render(data.hits);
        smoothScroll();
        observer.observe(refs.sentinel);
      }
      return data;
    })
    .catch(err => err.message)
    .finally(() => refs.spinner.classList.add('js-hidden'));

  await lightbox.refresh();
  await lightbox.on('shown.simplelightbox', function () {
    refs.body.classList.add('disable-scroll');
  });
  await lightbox.on('closed.simplelightbox', function () {
    refs.body.classList.remove('disable-scroll');
  });
}

function onEntry(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting && query !== '') {
      _page += 1;
      observer.observe(refs.sentinel);
      refs.spinner.classList.remove('js-hidden');
      await fetchImage(query, _page, _per_page)
        .then(data => {
          render(data.hits);
          smoothScroll();
          return data;
        })
        .then(data => {
          const totalPage = data.totalHits / _per_page;
          if (_page >= totalPage) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            observer.unobserve(refs.sentinel);
            return;
          }
        })
        .catch(err => err.message)
        .finally(() => refs.spinner.classList.add('js-hidden'));
      await lightbox.refresh();
      await lightbox.on('shown.simplelightbox', () => {
        refs.body.classList.add('disable-scroll');
      });
      await lightbox.on('closed.simplelightbox', () => {
        refs.body.classList.remove('disable-scroll');
      });
    }
  });
}

function render(items) {
  const markup = items.map(getItemsTemplate).join('');
  return refs.gallery.insertAdjacentHTML('beforeend', markup);
}

async function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
const getItemsTemplate = ({
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

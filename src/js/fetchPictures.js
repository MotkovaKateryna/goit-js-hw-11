import axios from 'axios';
// const { default: axios } = require('axios');

const BASE_URL = 'https://pixabay.com/api/';
const MY_KEY = '32149737-e90c4fbf5b87dac3ddee3c5b3';
const searchParams = {
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
};

export async function fetchPictures(query, page, per_page) {
  const data = await axios.get(
    `${BASE_URL}?key=${MY_KEY}&q=${query}&page=${page}&per_page=${per_page}`,
    searchParams
  );
  return data;
}

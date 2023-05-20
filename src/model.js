import onChange from "on-change";
import _ from 'lodash';
import yup from "yup";
import render from './view.js';

const validateForm = (link, currentLinks) => {
  const schema = yup.string().url().notOneOf(currentLinks);
  return schema.validate(link);
}

export default (i18n) => {

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submitButton: document.querySelector('button[type="submit"]'),
    status: document.querySelector('.feedback'),
    outputFeed: document.querySelector('.feeds'),
    outputPost: document.querySelector('.posts'),
    postButtons: document.querySelectorAll('button[data-bs-target="#modal"]'),
  };

  const initialState = {
    valid: true,
    inputValue: '',
    process: {
      processState: 'filling', // filling, sending, success, error
      error: '',
    },
    content: {
      posts: [],
      feeds: [],
    },
    uiState: {
      visitedLinksIds: new Set(),
      modalId: '',
    },
  };

  const watchedState = onChange(initialState, render(elements, initialState, i18n));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    validateForm(watchedState.inputValue, urlList)
      .then(() => {
        state.form.validate = 'valid';
      })
  })
};

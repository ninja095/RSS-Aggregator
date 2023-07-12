import onChange from 'on-change';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import { string, setLocale } from 'yup';
import resources from './locales/index.js';
import render from './view.js';
import parser from './parser.js';

const validateLink = (link, rssLinks) => {
  const schema = string().trim().required().url()
    .notOneOf(rssLinks);
  return schema.validate(link);
};

const buildProxyUrl = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';
  const proxyUrl = new URL(allOriginsLink);

  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return proxyUrl.toString();
};

const fetchData = (url) => {
  const proxyUrl = buildProxyUrl(url);
  return axios.get(proxyUrl);
};

const createPosts = (state, newPosts, feedId) => {
  const preparedPosts = newPosts.map((post) => ({ ...post, feedId, id: uniqueId() }));
  state.posts = [...state.posts, ...preparedPosts];
};

const timeout = 5000;
const getNewPosts = (state) => {
  const promises = state.feeds
    .map(({ link, feedId }) => fetchData(link)
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const addedPosts = state.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
        if (newPosts.length > 0) {
          createPosts(state, newPosts, feedId);
        }
      }));

  Promise.allSettled(promises)
    .finally(() => {
      setTimeout(() => getNewPosts(state), timeout);
    });
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: true,
      resources,
    })
    .then(() => {
      setLocale({
        mixed: {
          notOneOf: 'doubleRss',
        },
        string: {
          url: 'invalidUrl',
        },
      });

      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        example: document.querySelector('.text-muted'),
        feedback: document.querySelector('.feedback'),
        button: document.querySelector('button[type="submit"]'),
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
        modal: {
          modalElement: document.querySelector('.modal'),
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          showFull: document.querySelector('.full-article'),
        },
      };

      const initialState = {
        form: {
          state: 'filling', //validating, valid, error
          error: null,
        },

        loadingProcess: {
          state: 'waiting', // loading, finished, error,
          error: null,
        },

        feeds: [],
        posts: [],

        uiState: {
          visitedLinksIds: new Set(),
          modalId: '',
        },
      };

      const watchedState = onChange(initialState, render(elements, initialState, i18nInstance));

      getNewPosts(watchedState);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const inputValue = formData.get('url').trim();

        const urlsList = watchedState.feeds.map(({ link }) => link);

        watchedState.form.state = 'validating';

        validateLink(inputValue, urlsList)
          .then(() => {
            watchedState.form.state = 'valid';
            fetchData(inputValue)
              .then((response) => {
                watchedState.loadingProcess.state = 'sending';

                const data = response.data.contents;
                const {feed, posts} = parser(data);

                const feedId = uniqueId();
                watchedState.feeds.push({...feed, feedId, link: inputValue});
                createPosts(watchedState, posts, feedId);

                watchedState.loadingProcess.state = 'finished';
              })
              .catch((requestError) => {

                console.log('state loadingProcess', watchedState.loadingProcess.state);

                if (requestError.isAxiosError) {
                  watchedState.loadingProcess.error = 'Network Error';
                  console.log('Network Error isAxiosError', watchedState.loadingProcess.error);
                } else if (requestError.isParsingError) {
                  watchedState.loadingProcess.error = 'noRSS';
                  console.log('isParsingError', watchedState.loadingProcess.error)
                } else {
                  watchedState.loadingProcess.error = requestError.message ?? 'defaultError';
                }
                watchedState.loadingProcess.state = 'error';
              })
          })
          .catch((validationError) => {

            console.log('state form', watchedState.form.state);

            watchedState.form.error = validationError.message ?? 'defaultError';
            console.log('validationError form', watchedState.form.error)
            watchedState.form.state = 'error';
          });
      });

      elements.modal.modalElement.addEventListener('show.bs.modal', (e) => {
        const postId = e.relatedTarget.getAttribute('data-id');
        watchedState.uiState.visitedLinksIds.add(postId);
        watchedState.uiState.modalId = postId;
      });

      elements.posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        if (postId) {
          watchedState.uiState.visitedLinksIds.add(postId);
        }
      });

      // elements.form.addEventListener("submit", (e=>{
      //     e.preventDefault();
      //     const t = new FormData(e.target).get("url");
      //     ((e,t)=>{
      //         const n = t.map((e=>e.url));
      //         return i.notOneOf(n).validate(e).then((()=>null)).catch((e=>e.message))
      //       }
      //     )(t, s.feeds).then((e=>{
      //         e ? s.form = {
      //           ...s.form,
      //           valid: !1,
      //           error: e.key
      //         } : (s.form = {
      //           ...s.form,
      //           valid: !0,
      //           error: null
      //         },
      //           ((e,t)=>{
      //               e.loadingProcess.status = "loading";
      //               const n = jo(t);
      //               Ci.get(n, {
      //                 timeout: 1e4
      //               }).then((n=>{
      //                   const r = Hs(n.data.contents)
      //                     , i = {
      //                     url: t,
      //                     id: Ai(),
      //                     title: r.title,
      //                     description: r.descrpition
      //                   }
      //                     , s = r.items.map((e=>({
      //                     ...e,
      //                     channelId: i.id,
      //                     id: Ai()
      //                   })));
      //                   e.posts.unshift(...s),
      //                     e.feeds.unshift(i),
      //                     e.loadingProcess.error = null,
      //                     e.loadingProcess.status = "idle",
      //                     e.form = {
      //                       ...e.form,
      //                       status: "filling",
      //                       error: null
      //                     }
      //                 }
      //               )).catch((t=>{
      //                   console.log(t),
      //                     e.loadingProcess.error = (e=>e.isParsingError ? "noRss" : e.isAxiosError ? "network" : "unknown")(t),
      //                     e.loadingProcess.status = "failed"
      //                 }
      //               ))
      //             }
      //           )(s, t))
      //       }
      //     ))
      //   }
      // ));
    });
};

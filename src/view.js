const handleValidate = (elements, validate) => {
  if (validate === 'valid') {
    elements.input.classList.remove('is-invalid');
    return;
  }
  if (validate === 'invalid') {
    elements.input.classList.add('is-invalid');

  }
};

const outputError = (elements, error, i18n) => {
  const { message } = error;
  elements.status.textContent = i18n.t(message);
};

const outputSuccess = (elements, i18n) => {
  elements.input.classList.remove('is-invalid');
  elements.status.classList.remove('text-danger');
  elements.status.classList.add('text-success');
  elements.status.textContent = i18n.t('feedback.success');
};

const handleState = (elements, initialState, currentValue, i18n) => {
  switch (currentValue ) {
    case 'sending':
      elements.submitButton.disabled = true;
      break;
    case 'success':
      elements.submitButton.disabled = false;
      elements.form.reset();
      elements.input.focus();
      outputSuccess(elements, i18n);
      break;
    case 'error':
      elements.submitButton.disabled = false;
      elements.status.classList.add('text-danger');
      elements.status.classList.remove('text-success');
      break;
    default:
      break;
  }
}

export default (elements, initialState, i18n) => (path, value) => {
  switch (path) {
    case 'form.validate':
      handleValidate(elements, value);
      break;
    case 'form.processState':
      handleState(elements, initialState, value, i18n);
      break;
    // case 'data.feedList':
    //   outputFeed(elements, initialState);
    //   break;
    // case 'data.postList':
    //   outputPost(elements, initialState, i18n);
    //   break;
    case 'form.errors':
      outputError(elements, value, i18n);
      break;
    // case 'uiState.modal':
    //   handleModal(initialState, elements);
    //   break;
    // case 'uiState.visitedPostId':
    //   initialState.uiState.visitedPostId.forEach((id) => {
    //     const link = elements.outputPost.querySelector(`a[data-id="${id}"]`);
    //     link.classList.remove('fw-bold');
    //     link.classList.add('fw-normal', 'link-secondary');
    //   });
    //   break;
    default:
      break;
  }
};

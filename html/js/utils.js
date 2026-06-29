const SiprasUtils = {
  qs(selector, scope = document) {
    return scope.querySelector(selector);
  },

  getCurrentPage() {
    return document.body.dataset.page || 'home';
  }
};

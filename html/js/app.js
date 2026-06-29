const SiprasApp = {
  init() {
    document.documentElement.dataset.ready = 'true';
    document.documentElement.dataset.page = SiprasUtils.getCurrentPage();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SiprasApp.init();
});

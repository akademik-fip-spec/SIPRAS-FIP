const SiprasRouter = {
  routes: {
    home: '?page=home',
    dashboard: '?page=dashboard'
  },

  getRoute(page) {
    return this.routes[page] || this.routes.home;
  }
};

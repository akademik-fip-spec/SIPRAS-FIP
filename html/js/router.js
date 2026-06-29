const SiprasRouter = {
  routes: {
    home: '?page=home',
    dashboard: '?page=dashboard',
    building: '?page=building'
  },

  getRoute(page) {
    return this.routes[page] || this.routes.home;
  }
};

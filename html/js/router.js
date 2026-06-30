const SiprasRouter = {
  routes: {
    home: '?page=home',
    dashboard: '?page=dashboard',
    building: '?page=building',
    room: '?page=room'
  },

  getRoute(page) {
    return this.routes[page] || this.routes.home;
  }
};

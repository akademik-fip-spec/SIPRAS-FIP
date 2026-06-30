const SiprasRouter = {
  routes: {
    home: '?page=home',
    dashboard: '?page=dashboard',
    building: '?page=building',
    room: '?page=room',
    facility: '?page=facility',
    inventory: '?page=inventory'
  },

  getRoute(page) {
    return this.routes[page] || this.routes.home;
  }
};

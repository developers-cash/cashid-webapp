export default {
  namespaced: true,
  state: {
    firstTime: true,
    identities: {}
  },
  getters: {
    identities: (state) => state.identities
  },
  mutations: {
    setIdentities: (state, identities) => { state.identities = identities }
  },
  actions: {

  }
}

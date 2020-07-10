<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
// import LibCash from '@developers.cash/libcash-js'

export default {
  name: 'App',

  data () {
    return {
      libCash: null
    }
  },

  async created () {
    /* console.log('executed')

    // Create libCash Instance
    this.libCash = new LibCash()

    // Get all identities
    const identities = this.$store.getters['app/identities']

    // For each identity, compute WIF
    for (const id in Object.keys(identities)) {
      const identity = identities[id]
      const rootSeedBuffer = await this.libCash.Mnemonic.toSeed(identity.mnemonic)
      const masterHDNode = await this.libCash.HDNode.fromSeed(rootSeedBuffer)
      const childNode = await masterHDNode.derivePath("m/44'/145'/0'/0")
      identity.ecPair = await this.libCash.ECPair.fromWIF(this.libCash.HDNode.toWIF(childNode))
    }

    // Update store with computed keys
    this.$store.commit('app/setIdentities', identities) */
  }
}
</script>

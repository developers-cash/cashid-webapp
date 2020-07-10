<template>
  <q-page class="page-container">
    <!-- Note -->
    <q-card class="my-card bg-secondary text-white q-mb-xl">
      <q-card-section>
        <div class="text-h6">Create New Identity</div>
      </q-card-section>

      <q-card-section>
        <p>All keys are stored on the device (in this case, in your Browser's Local Storage) and therefore cannot be retrieved by this service if lost. It is your responsibility to backup your 12 word mnemonic.</p>
        <p>Your mnemonic will not be saved. Instead, a WIF at the derivation path of `m/44'/145'/0'/0` will be saved.</p>
      </q-card-section>

      <q-separator dark />
    </q-card>

    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        outlined
        type="text"
        class="q-mb-lg"
        v-model="identity.name"
        label="Name"
        hint="A human-readable identifier for this identity"
      />

      <q-input
        outlined
        type="textarea"
        class="q-mb-lg"
        v-model="mnemonic"
        label="Mnemonic"
        hint="If you already have a mnemonic you would like to use, copy it into field above."
      />

      <div class="text-center">
        <q-btn label="Create Identity" type="submit" color="secondary" class="full-width" size="lg" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import LibCash from '@developers.cash/libcash-js'

export default {
  name: 'PageIndex',

  data () {
    return {
      libCash: null,
      mnemonic: '',
      identity: {
        format: 'CASHID_0.1',
        name: '',
        wif: '',
        fields: {}
      }
    }
  },

  created () {
    this.libCash = new LibCash()

    const entropy = this.libCash.Crypto.randomBytes(16)
    this.mnemonic = this.libCash.Mnemonic.fromEntropy(entropy)
  },

  methods: {
    async onSubmit () {
      try {
        // Validate mnemonic
        // TODO Need to fix this function, it's full fucked
        // this.libCash.Mnemonic.validate(this.seed, this.libCash.Mnemonic.wordLists().english)

        // Convert to WIF immediately
        // This service will never be a full-fledged wallet. So, let's just store the WIF.
        // Benefit of this from security pov is that if a user is using an existing wallet mnemonic,
        // we only ever risk leaking the keypair to the derivation path listed below.
        const rootSeedBuffer = await this.libCash.Mnemonic.toSeed(this.mnemonic)
        const masterHDNode = await this.libCash.HDNode.fromSeed(rootSeedBuffer)
        const childNode = await masterHDNode.derivePath("m/44'/145'/0'/0")
        this.identity.wif = this.libCash.HDNode.toWIF(childNode)

        // Let's generate an ID (makes things a bit safer)
        const id = this.libCash.ECPair.toCashAddress(this.libCash.ECPair.fromWIF(this.identity.wif))
          .replace('bitcoincash:', '')

        // Get identities
        const identities = this.$store.getters['app/identities']

        // Make sure it doesn't already exist
        if (identities[id]) {
          throw new Error(`Identity for ${id} already exists`)
        }

        // Add this new identity
        identities[id] = this.identity

        // Commit to VueX store (LocalStorage)
        this.$store.commit('app/setIdentities', identities)

        // Show notification
        this.$q.notify({
          type: 'positive',
          message: 'Identity created'
        })

        // Go back
        this.$router.go(-1)
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.message
        })
      }
    }
  }
}
</script>

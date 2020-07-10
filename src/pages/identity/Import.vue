<template>
  <q-page class="page-container">
    <!-- Note -->
    <q-card class="my-card bg-secondary text-white q-mb-xl">
      <q-card-section>
        <div class="text-h6">Import Identity</div>
      </q-card-section>

      <q-card-section>
        <p>Either scan or enter Raw JSON below and click 'Import" to import an existing Identity.</p>
      </q-card-section>

      <q-separator dark />
    </q-card>

    <qrcode-stream class="q-mb-xl" @decode="parseQrCode" @init="scanQRCode" />

    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        outlined
        type="textarea"
        class="q-mb-lg"
        v-model="identityRaw"
        label="Raw JSON"
        hint="JSON data for the identity"
      />

      <div class="text-center">
        <q-btn label="Import Identity" type="submit" color="secondary" class="full-width" size="lg" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import LibCash from '@developers.cash/libcash-js'
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  name: 'PageIndex',

  components: { QrcodeStream },

  data () {
    return {
      libCash: null,
      identityRaw: ''
    }
  },

  created () {
    this.libCash = new LibCash()
  },

  methods: {
    async onSubmit () {
      try {
        // Try to parse the JSON
        const identity = JSON.parse(this.identityRaw)

        // Let's generate an ID (makes things a bit safer)
        const id = this.libCash.ECPair.toCashAddress(this.libCash.ECPair.fromWIF(identity.wif))
          .replace('bitcoincash:', '')

        // Get identities
        const identities = this.$store.getters['app/identities']

        // Make sure it doesn't already exist
        if (identities[id]) {
          throw new Error(`Identity for ${id} already exists`)
        }

        // Add this new identity
        identities[id] = identity

        // Commit to VueX store (LocalStorage)
        this.$store.commit('app/setIdentities', identities)

        // Show notification
        this.$q.notify({
          type: 'positive',
          message: 'Identity imported'
        })

        // Go back
        this.$router.go(-1)
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.message
        })
      }
    },

    parseQrCode (value) {
      try {
        this.identityRaw = JSON.stringify(JSON.parse(value), 0, 2)
      } catch (err) {
        this.$q.notify({
          message: err.message,
          color: 'negative'
        })
      }
    },

    async scanQRCode (promise) {
      try {
        await promise
      } catch (error) {
        let message
        if (error.name === 'NotAllowedError') {
          message = 'ERROR: you need to grant camera access permisson'
        } else if (error.name === 'NotFoundError') {
          message = 'ERROR: no camera on this device'
        } else if (error.name === 'NotSupportedError') {
          message = 'ERROR: secure context required (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          message = 'ERROR: is the camera already in use?'
        } else if (error.name === 'OverconstrainedError') {
          message = 'ERROR: installed cameras are not suitable'
        } else if (error.name === 'StreamApiNotSupportedError') {
          message = 'ERROR: Stream API is not supported in this browser'
        }
        this.$q.notify({
          message: message,
          color: 'negative'
        })
      }
    }
  }
}
</script>

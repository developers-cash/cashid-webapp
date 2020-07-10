<template>
  <q-page class="page-container">
    <!-- Note -->
    <q-card class="my-card bg-secondary text-white q-mb-xl">
      <q-card-section>
        <div class="text-h6">CashID WebApp</div>
      </q-card-section>

      <q-card-section>
        <p>CashID is a Cryptographic Identity System built around Bitcoin Cash. This is a WebApp for CashID but, ideally, in future you will use either your Wallet or a dedicated Identity Manager app.</p>
        <p>All keys are stored on the device (in this case, in your Browser's Local Storage) and therefore cannot be retrieved by this service if lost. It is <strong>YOUR</strong> responsibility to backup your 12 word mnemonics.</p>
      </q-card-section>

      <q-separator dark />
    </q-card>

    <!-- Authorize Request -->
    <div class="q-mb-xl">
      <q-toolbar class="bg-secondary text-white shadow-2">
        <q-toolbar-title>Authorize Request</q-toolbar-title>
      </q-toolbar>
      <q-card>
        <q-card-section>
          <p>Paste the CashID Request URL below or click the Scan Icon:</p>
          <q-input
            outlined
            class="q-mb-md"
            type="text"
            v-model="requestUrl"
            label="Request URL"
            @input="parseCashIdRequest"
          >
            <template v-slot:after>
              <q-btn round dense flat icon="qr_code_scanner" @click="scanning = !scanning" />
            </template>
          </q-input>
          <qrcode-stream v-if="scanning" @decode="parseCashIdRequest" @init="scanQRCode" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Identities -->
    <q-toolbar class="bg-secondary text-white shadow-2">
      <q-toolbar-title>Identities</q-toolbar-title>
    </q-toolbar>
    <q-list bordered>
      <!-- Existing Identities -->
      <q-item v-for="(identity, id) in $store.state.app.identities" :key="id"  v-ripple :to="`/identity/edit/${id}`">
        <q-item-section avatar>
          <q-avatar>
            <q-img :src="identity.fields.picture || '/img/avatar.png'" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ identity.name }}</q-item-label>
          <q-item-label caption>{{ id }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <!-- Create new Identity -->
      <q-item clickable v-ripple to="/identity/create">
        <q-item-section avatar>
          <q-icon color="primary" name="person_add" />
        </q-item-section>

        <q-item-section>Create Identity</q-item-section>
      </q-item>
      <q-item clickable v-ripple to="/identity/import">
        <q-item-section avatar>
          <q-icon color="primary" name="qr_code_scanner" />
        </q-item-section>

        <q-item-section>Import Identity</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { CashId } from '@developers.cash/cashid-js'
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  name: 'PageIndex',

  components: { QrcodeStream },

  data () {
    return {
      requestUrl: '',
      scanning: false
    }
  },

  methods: {
    parseCashIdRequest (value) {
      try {
        CashId.parseRequest(value)
        this.$router.push(`/auth?request=${encodeURIComponent(value)}`)
      } catch (err) {
        this.$q.notify({
          message: 'Request is not a valid CashID request.',
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

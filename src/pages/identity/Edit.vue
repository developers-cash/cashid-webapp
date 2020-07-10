<template>
  <q-page class="page-container">
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >

      <div class="text-center">
        <q-avatar rounded size="256px">
          <q-img :src="identity.fields.picture || '/img/avatar.png'" />
        </q-avatar>
        <div class="q-ma-md"><strong>{{ identity.name }}</strong></div>
        <div class="q-ma-md">{{ usingIdentity }}</div>
        <div class="q-ma-md q-gutter-sm">
          <q-btn color="secondary" label="Export" @click="exportDialog = true" />
          <q-btn color="negative" label="Delete" @click="onDelete" />
        </div>
      </div>

      <template v-for="(field, i) in fields" >
        <q-input :key="i"
          outlined
          class="q-mb-lg"
          :type="field.type"
          v-model="field.value"
          :label="field.label"
        />
      </template>

      <div class="text-center">
        <q-btn label="Save Changes" type="submit" color="secondary" class="full-width" size="lg" />
      </div>
    </q-form>

    <q-dialog v-model="exportDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Export Identity</div>
        </q-card-section>

        <q-card-section class="q-pt-none text-center q-gutter-lg">
          <vue-qr :text="JSON.stringify(identity)" size="500" style="max-width:100%;"></vue-qr>
          <q-btn color="secondary" label="Export to File" @click="exportToFile" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import LibCash from '@developers.cash/libcash-js'
import CashIDFields from '../../helpers/cashidfields'
import VueQr from 'vue-qr'
import { exportFile } from 'quasar'

export default {
  name: 'PageIndex',

  components: { VueQr },

  data () {
    return {
      libCash: null,
      usingIdentity: '',
      identity: {},
      fields: [],
      exportDialog: false
    }
  },

  created () {
    this.libCash = new LibCash()

    this.usingIdentity = this.$route.params.identity

    // Get this identity
    this.identity = this.$store.getters['app/identities'][this.usingIdentity]

    console.log(JSON.stringify(this.identity))

    if (!this.identity) {
      throw new Error(`Identity ${this.usingIdentity} does not exist`)
    }

    const fields = []
    for (const field in CashIDFields) {
      fields.push(
        Object.assign({
          name: field,
          value: this.identity.fields[field] || '',
          required: false
        }, CashIDFields[field])
      )
    }
    console.log(fields)
    this.fields = fields
  },

  methods: {
    onSubmit () {
      try {
        // Get identities
        const identities = this.$store.getters['app/identities']

        // Compile metadata fields
        const metadata = {}
        for (const field of this.fields) {
          metadata[field.name] = field.value
        }

        // Update fields for this identity by merging
        this.identity.fields = Object.assign(
          this.identity.fields,
          metadata
        )

        // Commit to VueX store (LocalStorage)
        this.$store.commit('app/setIdentities', identities)

        // Show notification
        this.$q.notify({
          type: 'positive',
          message: 'Identity updated'
        })

        // Go back
        this.$router.go(-1)
      } catch (err) {
        // Show notification
        this.$q.notify({
          type: 'nergative',
          message: err.message
        })
      }
    },

    onDelete () {
      this.$q.dialog({
        title: 'Delete',
        message: 'Are you sure you want to delete this identity?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // Get identities
        const identities = this.$store.getters['app/identities']

        // Remove
        delete identities[this.usingIdentity]

        // Commit to Vuex Store
        this.$store.commit('app/setIdentities', identities)

        // Show notification
        this.$q.notify({
          type: 'positive',
          message: 'Identity deleted'
        })

        // Go back
        this.$router.go(-1)
      })
    },

    exportToFile () {
      const status = exportFile(`${this.identity.name} (${this.usingIdentity}).json`, JSON.stringify(this.identity, 0, 2))

      if (status !== true) {
        console.log('Error: ' + status)
      }
    }
  }
}
</script>

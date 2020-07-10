 <template>
  <q-page class="page-container">
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >

      <div class="text-center">
        <q-avatar rounded size="256px">
          <img :src="identity.fields.picture || '/img/avatar.png'">
        </q-avatar>
        <div class="q-ma-md"><strong>{{ identity.name }}</strong></div>
        <div>{{ usingIdentity }}</div>
      </div>

      <template v-for="(field, i) in fields" >
        <q-input :key="i"
          outlined
          :type="field.type"
          v-model="field.value"
          :label="field.label"
        >
          <template v-if="!field.required" v-slot:append>
            <q-checkbox v-model="field.include" />
          </template>
        </q-input>
      </template>

      <q-checkbox v-model="saveUpdated" label="Save updated fields against identity" />

      <hr/>

      <div class="row">
        <div class="col-6 text-left">
          <q-btn label="Back" color="secondary" class="q-pl-md q-pr-md" size="lg" @click="$router.go(-1)" />
        </div>
        <div class="col-6 text-right">
          <q-btn label="Authorize" type="submit" color="secondary" class="q-pl-md q-pr-md" size="lg" />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import LibCash from '@developers.cash/libcash-js'
import { CashId, CashIdClient } from '@developers.cash/cashid-js'
import CashIDFields from '../../helpers/cashidfields'

export default {
  name: 'PageIndex',

  data () {
    return {
      libCash: null,
      requestUrl: '',
      request: {},
      usingIdentity: null,
      identity: {},
      fields: [],
      saveUpdated: true,
      ecPair: null
    }
  },

  async created () {
    // Initialize LibCash
    this.libCash = new LibCash()

    // Get request information
    this.requestUrl = decodeURIComponent(this.$route.query.request)
    const request = CashId.parseRequest(this.requestUrl)
    this.request = request

    // Set the identity we'll be using
    this.usingIdentity = this.$route.params.identity

    // Get this identity
    this.identity = this.$store.getters['app/identities'][this.usingIdentity]

    // Compile list of fields
    const fields = []
    for (const type of ['required', 'optional']) {
      for (const field of this.request[type]) {
        fields.push(
          Object.assign({
            name: field,
            value: this.identity.fields[field] || '',
            required: (type === 'required'),
            include: true
          }, CashIDFields[field])
        )
      }
    }
    this.fields = fields
  },

  computed: {
    window () {
      return window
    }
  },

  methods: {
    async onSubmit () {
      try {
        const client = new CashIdClient(this.identity.wif)

        // Compile metadata fields
        const metadata = {}
        for (const field of this.fields) {
          if (field.include) {
            metadata[field.name] = field.value
          }
        }

        // If we should save updated fields
        if (this.saveUpdated) {
          // Get identities
          const identities = JSON.parse(JSON.stringify(this.$store.getters['app/identities']))

          // Update fields for this identity by merging
          this.identity.fields = Object.assign(
            this.identity.fields,
            metadata
          )

          // Update identities with updated information
          identities[this.usingIdentity] = this.identity

          // Update our VueX store
          this.$store.commit('app/setIdentities', identities)
        }

        // Create payload
        const payload = client.createResponse(this.requestUrl, metadata)

        // Send payload
        const res = await this.$axios.post(`https://${this.request.domain}${this.request.path}`, payload)

        // Show notification
        this.$q.notify({
          type: (res.data.status === 0) ? 'positive' : 'negative',
          message: (res.data.status === 0) ? 'Authentication successful' : res.data.message
        })

        // If it was successful, close window in 3 seconds
        if (res.data.status === 0) {
          setTimeout(() => {
            this.window.close()
          }, 3000)
        }
      } catch (err) {
        // Show notification
        this.$q.notify({
          type: 'positive',
          message: err.message
        })
      }
    }
  }
}
</script>

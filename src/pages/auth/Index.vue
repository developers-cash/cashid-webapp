 <template>
  <q-page class="page-container">
    <q-card class="my-card bg-secondary text-white q-mb-xl">
      <q-card-section>
        <div class="text-h6">{{ request.domain }}</div>
      </q-card-section>

      <q-card-section>
        This service is requesting the following information:
        <ul>
          <li v-for="field in request.required" :key="field">{{ field }}</li>
          <li v-for="field in request.optional" :key="field">{{ field }} (Optional)</li>
        </ul>
      </q-card-section>

      <q-separator dark />
    </q-card>

    <q-toolbar class="bg-secondary text-white shadow-2">
      <q-toolbar-title>Select Identity to use</q-toolbar-title>
    </q-toolbar>
    <q-list bordered>
      <!-- Existing Identities -->
      <q-item v-for="(identity, id) in $store.state.app.identities" :key="id" clickable v-ripple :to="`/auth/${id}?request=${encodeURIComponent(requestUrl)}`">
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

      <!-- Create New Identity -->
      <q-item clickable v-ripple to="/identity/create">
        <q-item-section avatar>
          <q-icon color="primary" name="person_add" />
        </q-item-section>

        <q-item-section>Create New Identity</q-item-section>
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

export default {
  name: 'PageIndex',

  data () {
    return {
      requestUrl: '',
      request: {}
    }
  },

  created () {
    this.requestUrl = decodeURIComponent(this.$route.query.request)

    const request = CashId.parseRequest(this.requestUrl)

    this.request = request
  }
}
</script>

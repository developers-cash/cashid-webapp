<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="text-white" style="text-decoration:none">
            <q-avatar>
              <img src="~assets/icon.svg">
            </q-avatar>
            CashID.App
          </router-link>
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <!-- Manage Identities -->
        <q-item clickable to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>
              Manage your CashID Identities/Authorize a Request
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Import Identities -->
        <q-item clickable @click="importIdentities">
          <q-item-section avatar>
            <q-icon name="cloud_download" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Import Identities</q-item-label>
            <q-item-label caption>
              Import Identities from JSON File
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Backup Identities -->
        <q-item clickable @click="exportIdentities">
          <q-item-section avatar>
            <q-icon name="cloud_upload" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Export Identities</q-item-label>
            <q-item-label caption>
              Backup all Identities to JSON File
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { exportFile } from 'quasar'

export default {
  name: 'MainLayout',

  data () {
    return {
      leftDrawerOpen: false
    }
  },

  methods: {
    // TODO
    importIdentities () {
      const identities = this.$store.getters['app/identities']

      const status = exportFile('identites.json', JSON.stringify(identities, 0, 2))

      if (status !== true) {
        console.log('Error: ' + status)
      }
    },

    exportIdentities () {
      const identities = this.$store.getters['app/identities']

      const status = exportFile('identites.json', JSON.stringify(identities, 0, 2))

      if (status !== true) {
        console.log('Error: ' + status)
      }
    }
  }
}
</script>

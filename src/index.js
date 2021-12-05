import { IndexedDB } from '@/js/indexedDB'

// Test import of an asset
import webpackLogo from '@/images/webpack-logo.svg'

// Test import of styles
import '@/styles/index.scss'

// Appending to the DOM
const logo = document.createElement('img')
logo.src = webpackLogo

const app = document.querySelector('#root')
app.append(logo)

// ===============================================

window.addEventListener('load', async () => {
  const formDataDB = await new IndexedDB('formData', 1, (db, oldVersion, newVersion) => {
    console.log(`Upgrading IndexedDB database from ${oldVersion} to ${newVersion}`)

    switch (oldVersion) {
      case 0: {
        const fields = db.createObjectStore('fields', { keyPath: 'name' })
        fields.createIndex('nameIdx', 'name', { unique: true })
      }
    }
  })
})

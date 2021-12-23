/* eslint-disable no-fallthrough */
/* eslint-disable no-console */

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
  const formDataDB = await new IndexedDB('formData', 2, (dbConnection, oldVersion, newVersion) => {
    console.log(`Upgrading IndexedDB database from ${oldVersion} to ${newVersion}`)

    const dbInstance = dbConnection.result

    switch (oldVersion) {
      case 0: {
        dbInstance.createObjectStore('fields', { keyPath: 'name', autoIncrement: true })
      }
      case 1: {
        const fieldsObjectStore = dbConnection.transaction.objectStore('fields')
        // just for testing, makes sense only when it's indexable
        fieldsObjectStore.createIndex('nameIdx', 'name', { unique: true })
      }
    }
  })

  // writing
  await formDataDB.update('fields', [{ name: 'test', value: '123' }], true)
  await formDataDB.update('fields', [{ value: 'any_value' }], true)

  //reading
  const transaction = formDataDB.db.transaction('fields')
  const objectStore = transaction.objectStore('fields')

  const request = objectStore.get('test')
  request.onsuccess = () => {
    console.log(request.result)
  }
  request.onerror = () => {
    console.log('Failed: ', request.error)
  }

  const multipleDataRequest = objectStore.getAll(IDBKeyRange.bound(1, 10))
  multipleDataRequest.onsuccess = () => {
    console.log(multipleDataRequest.result)
  }
  multipleDataRequest.onerror = () => {
    console.log('Failed: ', multipleDataRequest.error)
  }

  // fetching
  formDataDB.fetch('fields', null, 2, 10, (cursor) => {
    if (cursor) {
      console.log(cursor.value)
      cursor.continue()
    }
  })
})

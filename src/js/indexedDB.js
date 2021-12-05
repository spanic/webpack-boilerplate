export class IndexedDB {
  constructor(dbName, dbVersion, dbUpgradeFn) {
    return new Promise((resolve, reject) => {
      this.db = null

      if (!('indexedDB' in window)) {
        reject('IndexedDB is not supported here, try another browser')
      }

      const dbConnection = indexedDB.open(dbName, dbVersion)

      if (dbUpgradeFn) {
        dbConnection.onupgradeneeded = (event) =>
          dbUpgradeFn(dbConnection.result, event.oldVersion, event.newVersion)
      }

      dbConnection.onsuccess = () => {
        this.db = dbConnection.result
        resolve(this)
      }

      dbConnection.onerror = (event) => reject(`IndexedDB error: ${event.target.errorCode}`)

      // version change handler

      dbConnection.onversionchange = () => {
        dbConnection.close()
        alert('IndexedDB database upgrade required - reloading...')
        location.reload()
      }
    })
  }
}

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
          dbUpgradeFn(dbConnection, event.oldVersion, event.newVersion)
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

  update(storeName, value, overwrite = false) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      value = Array.isArray(value) ? value : [value]
      value.forEach((item) => {
        overwrite ? store.put(item) : store.add(item)
      })

      transaction.oncomplete = () => {
        resolve(true)
      }
      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }

  fetch(storeName, indexName, lower, upper, callback) {
    const request = this.getIndex(storeName, indexName).openCursor(this.getKeyBounds(lower, upper))

    request.onsuccess = () => {
      if (callback) {
        callback(request.result)
      }
    }
    request.onerror = () => {
      return request.error
    }
  }

  getIndex(storeName, indexName) {
    const transaction = this.db.transaction([storeName])
    const store = transaction.objectStore(storeName)
    return indexName ? store.index(indexName) : store
  }

  getKeyBounds(lower, upper) {
    if (lower && upper) {
      return IDBKeyRange.bound(lower, upper)
    } else if (lower) {
      return IDBKeyRange.lowerBound(lower) // greater than or equal to lower
    } else if (upper) {
      return IDBKeyRange.upperBound(upper) // less than or equal to upper
    }
  }
}

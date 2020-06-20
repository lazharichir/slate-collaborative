export default function openRecordsIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) reject("indexedDB not available.");

        let database = window.indexedDB.open("records", 1);
        database.addEventListener("upgradeneeded", (event) => {
            let db = database.result;
            switch (event.oldVersion) {
                case 0:
                    db.createObjectStore("RECORD_STORES");
            }
        });
        database.addEventListener("success", () => resolve(database.result));
        database.addEventListener("error", (event) => reject(event));
    });
}

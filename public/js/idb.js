let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore('new-transaction', {autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new-transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new-transaction');
    transactionObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new-transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new-transaction');
    const getAll = transactionObjectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {    
                    return response.json();
                })
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new-transaction'], 'readwrite');
                    const transactionObjectStore = transaction.objectStore('new-transaction');
                    transactionObjectStore.clear();

                    alert('All offline transactions have been saved!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction);
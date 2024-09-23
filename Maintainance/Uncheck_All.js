let table = base.getTable('Current');

const batchSize = 50;

let query = await table.selectRecordsAsync({
    fields: ["Present"]
});

let batchUpdates = [];

for (let record of query.records) {
    batchUpdates.push({
        id: record.id,
        fields: {
            'Present': false
        }
    });

    if (batchUpdates.length >= 50) {
        await table.updateRecordsAsync(batchUpdates);
        // Clear batch updates array
        batchUpdates = [];
    }
}

// Update remaining records in the last batch
await table.updateRecordsAsync(batchUpdates);
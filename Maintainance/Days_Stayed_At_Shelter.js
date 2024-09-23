let currentTable = base.getTable("Current");
let totalDailysTable = base.getTable("Total Daily A#'s Served");

let batchSize = 50;

let currentData = await currentTable.selectRecordsAsync({
        fields: ["A#", "Present", "Days Stayed at Shelter", "Record ID"]
    })

let totalDailysData = await totalDailysTable.selectRecordsAsync({
        fields: ["A#", "Present", "Days Stayed at Shelter"]
    })

let batchUpdates = [];

let daysStayedShelter = 0;
for (var i = 0; i < currentData.records.length; i++) {
    for (var j = 0; j < totalDailysData.records.length; j++) {
        if (currentData.records[i].getCellValueAsString("A#") == totalDailysData.records[j].getCellValueAsString("A#") && totalDailysData.records[j].getCellValue("Present") == true) {
            daysStayedShelter++;
        }
    }

    // Update Days Stayed At Shelter field
    batchUpdates.push({
        id: currentData.records[i].id,
        fields: {
            'Days Stayed at Shelter': daysStayedShelter
        }
    })
    // Reset daysStayedShelter counter
    daysStayedShelter = 0;

    if (batchUpdates.length >= batchSize) {
        await currentTable.updateRecordsAsync(batchUpdates);
        batchUpdates = [];
    }
}
// Update remaining records in the last batch
await currentTable.updateRecordsAsync(batchUpdates);
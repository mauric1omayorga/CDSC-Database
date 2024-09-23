archive();

async function archive() {
    let currentTable = base.getTable("Current");

    let date = new Date();

    // Adjust the current date to your local timezone (Mountain Standard Time)
    date.setUTCHours(date.getUTCHours() - 7); // MST is GMT-7

    // Format the date as YYYY-MM-DD
    let today = date.toISOString().split('T')[0];

    // Getting Records
    let currentData = await currentTable.selectRecordsAsync({
        fields: ["Full Name", "A#", "Present", "Date of Birth", "Sex", "Traveling in Family or Alone", "Family", "Country of Origin", "DOE US", "Processing Status", "Processing Type", "Date of Arrival", "Tentative Date of Departure", "City, State of Destination", "$FLAG$", "Notes", "Sponsor Full Name", "Sponsor Full Address", "Sponsor Phone Number", "Days Stayed at Shelter", "Interviewer", "Record ID"]
    })

    let recordsToArchive = [];

    // Collecting records to archive
    for (let i = 0; i < currentData.records.length; i++) {
        if (currentData.records[i].getCellValue("Present") == null) {
            if (currentData.records[i].getCellValue("Date of Arrival") != today) {
                recordsToArchive.push(currentData.records[i]);
            }
        }
    }

    let archivedTable = base.getTable("Archived");
    // Copying Records to Archived table in batches of 50
    let recordsBatch = [];
    let recordsToDelete = [];    
    for (let i = 0; i < recordsToArchive.length; i++) {
        if (recordsBatch.length % 50 === 0 && recordsBatch.length !== 0) {
        await archivedTable.createRecordsAsync(recordsBatch);         
        await currentTable.deleteRecordsAsync(recordsToDelete);
        recordsBatch = [];
        recordsToDelete = [];
        }

        recordsBatch.push({
            fields: {
                "Full Name": recordsToArchive[i].getCellValueAsString("Full Name"),
                "A#": Number(recordsToArchive[i].getCellValueAsString("A#")),
                "Present": recordsToArchive[i].getCellValue("Present"),
                "Date of Birth": recordsToArchive[i].getCellValue("Date of Birth"),
                "Sex": recordsToArchive[i].getCellValue("Sex"),
                "Traveling in Family or Alone": recordsToArchive[i].getCellValue("Traveling in Family or Alone"),
                "Family": recordsToArchive[i].getCellValue("Family"),
                "Country of Origin": recordsToArchive[i].getCellValue("Country of Origin"),
                "DOE US": recordsToArchive[i].getCellValue("DOE US"),
                "Processing Status": recordsToArchive[i].getCellValue("Processing Status"),
                "Processing Type": recordsToArchive[i].getCellValue("Processing Type"),
                "Date of Arrival": recordsToArchive[i].getCellValue("Date of Arrival"),
                "Tentative Date of Departure": recordsToArchive[i].getCellValue("Tentative Date of Departure"),
                "City, State of Destination": recordsToArchive[i].getCellValueAsString("City, State of Destination"),
                "$FLAG$": recordsToArchive[i].getCellValue("$FLAG$"),
                "Notes": recordsToArchive[i].getCellValueAsString("Notes"),
                "Sponsor Full Name": recordsToArchive[i].getCellValueAsString("Sponsor Full Name"),
                "Sponsor Full Address": recordsToArchive[i].getCellValueAsString("Sponsor Full Address"),
                "Sponsor Phone Number": recordsToArchive[i].getCellValueAsString("Sponsor Phone Number"),
                "Days Stayed at Shelter": Number(recordsToArchive[i].getCellValue("Days Stayed at Shelter")),
                "Final Date of Departure": today,
                "Interviewer": recordsToArchive[i].getCellValueAsString("Interviewer")
            }
        });
        recordsToDelete.push(recordsToArchive[i].getCellValueAsString("Record ID"));
    }


    if (recordsBatch.length > 0) {
        await currentTable.deleteRecordsAsync(recordsToDelete);
        await archivedTable.createRecordsAsync(recordsBatch);
    }
}
newArrivals();

async function newArrivals() {
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

    let recordsToMove = [];

    // Collecting records to move to New A#'s Processed Daily table
    for (let i = 0; i < currentData.records.length; i++) {
        if (currentData.records[i].getCellValue("Date of Arrival") == today) {
            recordsToMove.push(currentData.records[i]);
        }
    }

    let newAsTable = base.getTable("New A#'s Processed Daily");

    // Appending records to New A#'s Processed Daily in batches of 50
    let recordsBatch = [];    
    for (let i = 0; i < recordsToMove.length; i++) {
        if (recordsBatch.length % 50 === 0 && recordsBatch.length !== 0) {
        await newAsTable.createRecordsAsync(recordsBatch);         
        recordsBatch = [];
        }

        recordsBatch.push({
            fields: {
                "Full Name": recordsToMove[i].getCellValueAsString("Full Name"),
                "A#": Number(recordsToMove[i].getCellValueAsString("A#")),
                "Present": recordsToMove[i].getCellValue("Present"),
                "Date of Birth": recordsToMove[i].getCellValue("Date of Birth"),
                "Sex": recordsToMove[i].getCellValue("Sex"),
                "Traveling in Family or Alone": recordsToMove[i].getCellValue("Traveling in Family or Alone"),
                "Family": recordsToMove[i].getCellValue("Family"),
                "Country of Origin": recordsToMove[i].getCellValue("Country of Origin"),
                "DOE US": recordsToMove[i].getCellValue("DOE US"),
                "Processing Status": recordsToMove[i].getCellValue("Processing Status"),
                "Processing Type": recordsToMove[i].getCellValue("Processing Type"),
                "Date of Arrival": recordsToMove[i].getCellValue("Date of Arrival"),
                "Tentative Date of Departure": recordsToMove[i].getCellValue("Tentative Date of Departure"),
                "City, State of Destination": recordsToMove[i].getCellValueAsString("City, State of Destination"),
                "$FLAG$": recordsToMove[i].getCellValue("$FLAG$"),
                "Notes": recordsToMove[i].getCellValueAsString("Notes"),
                "Sponsor Full Name": recordsToMove[i].getCellValueAsString("Sponsor Full Name"),
                "Sponsor Full Address": recordsToMove[i].getCellValueAsString("Sponsor Full Address"),
                "Sponsor Phone Number": recordsToMove[i].getCellValueAsString("Sponsor Phone Number"),
                "Days Stayed at Shelter": Number(recordsToMove[i].getCellValue("Days Stayed at Shelter")),
                "Interviewer": recordsToMove[i].getCellValueAsString("Interviewer")
            }
        });
    }

    if (recordsBatch.length > 0) {
        await newAsTable.createRecordsAsync(recordsBatch);
        await newAsTable.createRecordAsync({"Full Name": recordsToMove.length.toString(), "Date of Arrival": today});
    }
}
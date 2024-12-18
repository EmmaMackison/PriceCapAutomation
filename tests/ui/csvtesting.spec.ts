import { test,expect } from "../../src/fixtures/fixtures.ts";
import fs, { writeFile, writeFileSync } from "fs";
import { parse } from "csv-parse/sync"
import { convertArrayToCSV } from 'convert-array-to-csv'
//Below code will capture all records from the data file used to print PIN
const records = parse(fs.readFileSync("src/testdata/testbuckets/testdata.csv"), {
    columns: true,
    skip_empty_lines: true,
    //delimiter: ";",
})

const newRecord: Object[] = [];
test(`Csv Test `, async ({ page,  }) => {
    console.log(records.length);

    //Below code to create new Arrya
    newRecord.push({ Identification: 11, Firstname: 'Smith', Last: 'Roger' });
    newRecord.push({ Identification: 21, Firstname: 'Peter', Last: 'Williams' });
    newRecord.push({ Identification: 31, Firstname: 'Rohit', Last: 'Patel' });

    console.log(newRecord);
    //Below code to write final arrays to file
    const csvFromArrayOfObjects = convertArrayToCSV(newRecord);
    fs.writeFile('CSV Output/trial.csv', csvFromArrayOfObjects, err => {
        if (err) {
            console.log(18, err);
        }
        console.log('CSV file created');
    })

})




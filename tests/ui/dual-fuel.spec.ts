import { test, expect } from "../../src/fixtures/fixtures.ts";
import fs, { writeFile, writeFileSync } from "fs";
import { parse } from "csv-parse/sync"
import { convertArrayToCSV } from 'convert-array-to-csv'
import { annotate } from '../../src/utils/shared/annotate.ts'


test(`Csv Test `, async ({ page, }) => {
    // Step 1: Below section will read the bucket file
    annotate('Given we got testing data bucket file and its sorted');
    const originalDataBucket = parse(fs.readFileSync("src/testdata/testbuckets/testdata.csv"), {
        columns: true,
        skip_empty_lines: true,
        //delimiter: ";",
    })
    annotate('When we perfomed required calculation');


    annotate('And we add create new records based on the calculation');
    const newBucketData: Object[] = [];
    console.log(originalDataBucket);// Accessing whole original csv file as an array
    // console.log(originalBucketData[0]);//Accessing individual element of above array
    // console.log(Object.keys(originalBucketData[0]));//Accessing keys of the original csv files

    //console.log(Object.keys(originalBucketData[0]));//Accessing keys of the original csv files

    interface DualFuelProofingObject {

        EleAccountNo: number, GasAccountNumber :number ,GSP: string,
        NewSC: number, NewStandingChargeCorrect: string,
        NewRate1: number, NewUnitRate1Correct: string,
        NewRate2: number, NewUnitRate2Correct: string,
        NewRate3: number, NewUnitRate3Correct: string,
        NewRate4: number, NewUnitRate4Correct: string,
        OldAnnualCost: number, NewAnnualCost: number,
        Changedifference: number, ChangeAmountCorrect: string, PdfPersonalProjection: number,
        manualCalculationPersonalProjection: number, Difference: number,
        AreFrontPageCalcscorrect: string, RelevantCheapestTariffCorrect: string,
        ActualCheapestTariffCorrect: string,
    }
    for (const property in originalDataBucket) {

        const proofingSheetObject: DualFuelProofingObject & { [key: string]: any } = {
            EleAccountNo: '', GasAccountNumber:'', GSP: '',
            NewSC: '', NewStandingChargeCorrect: '',
            NewRate1: '', NewUnitRate1Correct: '',
            NewRate2: '', NewUnitRate2Correct: '',
            NewRate3: '', NewUnitRate3Correct: '',
            NewRate4: '', NewUnitRate4Correct: '',
            OldAnnualCost: '', NewAnnualCost: '',
            Changedifference: '', ChangeAmountCorrect: '',
            PdfPersonalProjection: '', manualCalculationPersonalProjection: '', Difference: '',
            AreFrontPageCalcscorrect: '', RelevantCheapestTariffCorrect: '', ActualCheapestTariffCorrect: '',


        };

        newBucketData.push(proofingSheetObject);

    }

    //console.log(newBucketData);

    annotate('The we should be able to generate new CSV testing file');
    //Below code to write final arrays to file
    const csvFromArrayOfObjects = convertArrayToCSV(newBucketData);
    fs.writeFile('CSV Output/trial.csv', csvFromArrayOfObjects, err => {
        if (err) {
            console.log(18, err);
        }
        console.log('CSV file created');
    })

})




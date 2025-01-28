import { test, expect } from "../../../src/fixtures/fixtures.ts";
import fs, { writeFile, writeFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { convertArrayToCSV } from 'convert-array-to-csv';
import { annotate } from '../../../src/utils/shared/annotate.ts';
import { ElectircMeterActions } from "../../../Actions/electricActions.ts";

test('DualFuel test', async ({ page }) => {

    //     const obje = new ElectircMeterActions();
    //   obje.ePass();
    // Step 1: Read the databucket file
    annotate('Get sorted testing bucket file');
    const dualFuelBucket = parse(fs.readFileSync("src/testdata/testbuckets/Simpler Energy - Gas Only - On Demand - Post.csv"), {
        columns: true,
        skip_empty_lines: true,
        //delimiter: ";",      
    });
    //Step2:Read the latest price 
    annotate('Getting price data');
    const newPriceData = parse(fs.readFileSync("src/testdata/newpricefiles/January Live Run Calculator - Rohit - Tariff Info & Rates.csv"), {
        columns: true,
        skip_empty_lines: true,
        //delimiter: ";",
    })
    //Step 3: Declare new Proofing Object prototype 
    interface ProofingObject {
        Date: string, Checker: string, Page: string,
        Account_No: number, Cust_Name_Correct: string, Cust_Address_Correct: string,
        Beyond_Eligibility: string, Marketing_Preference: string, Marketing_Consent_Correct: string,
        GSP: string, Fuel: string, Tariff: string, Meter_Type: string, Payment_Method: string,

        NewSC_PIN: number, NewSC_PriceFile: any,
        NewR1_PIN: number, NewR1_PriceFile: any,
        /*NewR2_PIN: any, NewR2_PriceFile: any,
        NewR3_PIN: any, NewR3_PriceFile: any,
        NewR4_PIN: any, NewR4_PriceFile: any,*/
        New_SC_Rates_Correct: string,

        OldAnnualCost: number, NewAnnualCost: number, ChangeDifference: number, ChangeAmountCorrect: String,
        PIN_Personal_Projection: number, Calculated_Personal_Projection: number, Difference: number, AreFrontPageCalculationCorrect: string,
        SimilarTariff: string, SimilarMeter: string, Cheapest_Similar_Projection: number, Cheapest_Similar_Saving: number,
        Cheapest_Similar_Saving_Correct: string,
        OverallTariff: string, OverallMeter: string, Cheapest_Overall_Projection: number, Cheapest_Overall_Saving: number,
        Cheapest_Overall_Saving_Correct: string,

        PresentmentCorrect: string, Incr_Decr_Check: string, Creative: string,
        PassFailUnsure: string,
        Comments: string,
    }
    //Step:4 Declare an object to store and generate new csv with calculation
    const newDualFuelBucketData: Object[] = [];
    //Step:5 Navigate thorough each row,received  from Step 1: data bucket and perform calculation    
    const cheapestTariffs: string[] = ['1 Year Fixed', '1 Year Fixed Economy 7', '1 Year Fixed Loyalty', '1 Year Fixed Loyalty Economy 7',
        '1 Year Fixed + Boiler Cover', '1 Year Fixed + Boiler Cover Economy 7', '1 Year Fixed + Greener Electricity',
        '1 Year Fixed + Greener Electricity Economy 7', '1 Year Fixed Loyalty - Domestic Economy', '2 Year Fixed Energy - Economy 7', '3 Year Fixed - Economy 7',
        '3 Year Fixed v5 EPG', '3 Year Fixed v5 EPG - Economy 7'];
    const multiRateElectircMeters: string[] = ['Economy 7', 'Economy 10', 'Domestic Economy', 'Smart Economy 9', '2 Rate',
        'THTC', 'Flex Rate', '2 Rate (Heating)', 'Superdeal', '3 Rate (Heating)', '3 Rate (E&W, Heating)',
        '4 Rate', 'Economy & Heating Load', 'Heatwise 2 Rate', 'Heatwise 3 Rate', 'Region Specific',];
    const standardMeters = ['Standard', '1 Year Fixed', '1 Year Fixed Loyalty', '1 Year Fixed + Boiler Cover', '1 Year Fixed + Greener Electricity'];
    const twoRateMeters = ['2 Rate', 'Economy 7', '1 Year Fixed Economy 7', 'Economy 10', 'Domestic Economy', 'Smart Economy 9', 'THTC', 'Flex Rate', '2 Rate (Heating)',
        'Heatwise 2 Rate', '1 Year Fixed Loyalty Economy 7', '1 Year Fixed + Boiler Cover Economy 7', '1 Year Fixed + Greener Electricity Economy 7'];
    const threeRateMeters = ['3 rate', 'Superdeal', '3 Rate (Heating)', '3 Rate (E&W, Heating)', 'Economy & Heating Load', 'Heatwise 3 Rate', 'Region Specific'];
    const fourRateMeters = '4 rate';

    //Step 5.1 Navigating through each record of data bucket starts here
    for (const property in dualFuelBucket) {
        //Step 5.1.1: Filtering price file according to zone of cutomer
        let customerZone = dualFuelBucket[property].Zone_1;
        if (customerZone == undefined) {
            customerZone = dualFuelBucket[property].Zone;
        }
        let zoneBasedPriceData = newPriceData.filter(function (el) {
            return el[5] === customerZone;
        });

        //Step 5.1.2: Filtering price file according to Meter type
        if (zoneBasedPriceData.length) {
            //Capturing cheapest similar gas prices         

            let cheapestSimilarGasMeter = '';
            let cheapestSimilarGas = dualFuelBucket[property].Gas_Cheapest_Similar_Tariff;
            let replaceGasSimilar = cheapestSimilarGas.replace(/[^a-zA-Z0-9]/g, '');
            let similarGChecker: boolean = true;
            cheapestTariffs.forEach((element) => {
                let ele = element.replace(/[^a-zA-Z0-9]/g, '');
                if (replaceGasSimilar === ele && replaceGasSimilar.length === ele.length) {
                    cheapestSimilarGas = element; similarGChecker = false;
                } //else { similarGChecker = true; }
            });
            if (similarGChecker) {
                if ((cheapestSimilarGas === 'Simpler Energy' || cheapestSimilarGas === 'Warmer Home Plan' || cheapestSimilarGas === 'Pay As You Go')) {
                    cheapestSimilarGas = 'Standard';
                }
                else {
                    multiRateElectircMeters.forEach((element) => {
                        if (cheapestSimilarGas.includes(element)) {
                            cheapestSimilarGas = element;
                        }
                    });
                }
            }

            for (const prop in zoneBasedPriceData) {
                if (cheapestSimilarGas === zoneBasedPriceData[prop][3]) {
                    cheapestSimilarGasMeter = cheapestSimilarGas;
                }
                // else{ cheapestSimilarGas ='';}
            }
            let cheapestGasSimilarPriceData = [];
            if (cheapestSimilarGasMeter !== '') {
                cheapestGasSimilarPriceData = zoneBasedPriceData.filter(function (el) {
                    return (el[3] === cheapestSimilarGasMeter && el[4] === 'Gas');
                });
            }
            //Capturing cheapest overall gas
            let cheapestOverallGasMeter = '';
            let cheapestOverallGas = dualFuelBucket[property].Gas_Cheapest_Overall_Tariff;
            let overallGChecker = true;
            let replaceGasOverall = cheapestOverallGas.replace(/[^a-zA-Z0-9]/g, '');

            cheapestTariffs.forEach((element) => {
                let ele = element.replace(/[^a-zA-Z0-9]/g, '');
                if (replaceGasOverall === ele && replaceGasOverall.length === ele.length) { cheapestOverallGas = element; overallGChecker = false; }
                // else { overallGChecker = true; }

            });
            if (overallGChecker) {
                if (cheapestOverallGas === 'Simpler Energy' || cheapestOverallGas === 'Warmer Home Plan' || cheapestOverallGas === 'Pay As You Go') { cheapestOverallGas = 'Standard'; }
                else {
                    multiRateElectircMeters.forEach((element) => {
                        if (cheapestOverallGas.includes(element)) {
                            cheapestOverallGas = element;
                        }
                    });
                }
            }

            for (const prop in zoneBasedPriceData) {
                if (cheapestOverallGas === zoneBasedPriceData[prop][3]) {
                    cheapestOverallGasMeter = cheapestOverallGas;

                }
                //else{cheapestOverallGas = '';}
            }

            let cheapestGasOverallPriceData = [];
            if (cheapestOverallGasMeter !== '') {
                cheapestGasOverallPriceData = zoneBasedPriceData.filter(function (el) {
                    return (el[3] === cheapestOverallGasMeter && el[4] === 'Gas');
                });
            }

            //Capturing current Gas Meter Type
            let gMeter: string = '';
            let gasTariffName: string = dualFuelBucket[property].Gas_Tariff_Name;
            if (!gasTariffName.includes('Fixed')) {
                if (gasTariffName === 'Simpler Energy' || gasTariffName === 'Warmer Home Plan' || gasTariffName === 'Pay As You Go') { gasTariffName = 'Standard'; }
                else {
                    gasTariffName = '';
                }
                for (const prop in zoneBasedPriceData) {
                    if (gasTariffName === zoneBasedPriceData[prop][3]) {
                        gMeter = gasTariffName;
                    }
                }
                let gasMeterBasedPriceData = [];
                if (gMeter !== '') {
                    gasMeterBasedPriceData = zoneBasedPriceData.filter(function (el) {
                        return (el[3] === gMeter);
                    });
                }
                if (gasMeterBasedPriceData.length) {
                    const gasPaymentMethod = dualFuelBucket[property].Gas_Payment_Method;
                    let cheapestSimilarGasPaymentMethod = '';
                    const cheapGasSimilarPayMethod = (dualFuelBucket[property].Gas_Cheapest_Similar_Tariff);
                    const cheapGasOverallPayMethod = (dualFuelBucket[property].Gas_Cheapest_Overall_Tariff);

                    let cheapestSimilarPaymentMethod = '';
                    if (cheapGasSimilarPayMethod.includes('Pay As You Go')) {
                        cheapestSimilarGasPaymentMethod = 'Prepayment';
                    }
                    else { cheapestSimilarGasPaymentMethod = 'Direct Debit'; }
                    let finalCheapestGasSimilarData = cheapestGasSimilarPriceData.filter(function (el) {
                        return el[10] === cheapestSimilarGasPaymentMethod;
                    });
                    let cheapestOverallGasPaymentMethod = '';
                    let cheapestOverallPaymentMethod = '';
                    if (cheapGasOverallPayMethod.includes('Pay As You Go')) {
                        cheapestOverallGasPaymentMethod = 'Prepayment';
                    }
                    else { cheapestOverallGasPaymentMethod = 'Direct Debit'; }
                    let finalCheapestGasOverallData = cheapestGasOverallPriceData.filter(function (el) {
                        return el[10] === cheapestOverallGasPaymentMethod;
                    });
                    let gasPayMethod = '';
                    for (const prop1 in gasMeterBasedPriceData) {
                        if (gasPaymentMethod === gasMeterBasedPriceData[prop1][10]) {
                            gasPayMethod = gasPaymentMethod;
                        }
                    }
                    let gasFinalPriceData = gasMeterBasedPriceData.filter(function (el) {
                        return (el[10] === gasPayMethod);
                    });
                    if (gasFinalPriceData.length) {
                        const standardGasPrice: any[] = gasFinalPriceData.filter(newPrice => newPrice[4] === 'Gas');
                        if (standardGasPrice.length) {
                            /*const gPass = () => {        
                                if (Number(dualFuelBucket[property].Gas_New_Stdg_Chrg_Inc_Vat).toFixed(4) === Number(standardGasPrice[0]['13.0000']).toFixed(4)) {
                                    return 'Pass';
                                }
                                else {
                                    console.log(dualFuelBucket[property].Gas_New_Stdg_Chrg_Inc_Vat, standardGasPrice[0]['13.0000'])
                                    return 'Fail';
                                }
                            }*/
                            const totalGasCurrentCost = () => {
                                let standingCharge = 365 * Number(standardGasPrice[0]['13.0000']);
                                let rate1 = Number(standardGasPrice[0]['17.0000']) * Number(dualFuelBucket[property].Gas_Annual_Usage);
                                return Number((rate1 + standingCharge).toFixed(2));
                            }
                            const totalGasSimilarCost = () => {
                                if (finalCheapestGasSimilarData.length) {
                                    let standingCharge = 365 * Number(finalCheapestGasSimilarData[0]['13.0000']);
                                    let rate1 = Number(finalCheapestGasSimilarData[0]['17.0000']) * Number(dualFuelBucket[property].Gas_Annual_Usage);
                                    return Number((rate1 + standingCharge).toFixed(2));
                                } else { return 0; }
                            }

                            const totalGasOverallCost = () => {
                                if (finalCheapestGasOverallData.length) {
                                    let standingCharge = 365 * Number(finalCheapestGasOverallData[0]['13.0000']);                                    
                                    let rate1 = Number(finalCheapestGasOverallData[0]['17.0000']) * Number(dualFuelBucket[property].Gas_Annual_Usage);
                                    return Number((rate1 + standingCharge).toFixed(2));
                                }
                                else { return 0; }
                            }

                            //Single Gas object start here  
                            const gasProofingSheetObject: ProofingObject & { [key: string]: any } = {
                                Date: '', Checker: '', Page: '',
                                Account_No: dualFuelBucket[property].Gas_Customer_No, Cust_Name_Correct: '', Cust_Address_Correct: '',
                                Beyond_Eligibility: dualFuelBucket[property].Beyond_Eligibility,
                                Marketing_Preference: dualFuelBucket[property].Marketing_pref, Marketing_Consent_Correct: '',
                                //GSP: dualFuelBucket[property].Zone_1, 
                                GSP: customerZone, Fuel: 'Gas',
                                Tariff: dualFuelBucket[property].Gas_Tariff_Name,
                                Meter_Type: standardGasPrice[0]['3'],
                                Payment_Method: dualFuelBucket[property].Gas_Payment_Method,

                                NewSC_PIN: dualFuelBucket[property].Gas_New_Stdg_Chrg_Inc_Vat, NewSC_PriceFile: standardGasPrice[0]['13.0000'],
                                NewR1_PIN: dualFuelBucket[property].Gas_New_Unit_1_Inc_Vat, NewR1_PriceFile: standardGasPrice[0]['17.0000'],
                              /*NewR2_PIN: 'N/A', NewR2_PriceFile: 'N/A',
                                NewR3_PIN: 'N/A', NewR3_PriceFile: 'N/A',
                                NewR4_PIN: 'N/A', NewR4_PriceFile: 'N/A',*/
                                New_SC_Rates_Correct: '',

                                OldAnnualCost: dualFuelBucket[property].Gas_Total_Old_Cost,
                                NewAnnualCost: dualFuelBucket[property].Gas_Total_New_Cost,
                                ChangeDifference: Number(dualFuelBucket[property].Gas_Total_New_Cost - dualFuelBucket[property].Gas_Total_Old_Cost),
                                ChangeAmountCorrect: '',

                                PIN_Personal_Projection: dualFuelBucket[property].Gas_Total_New_Cost,
                                Calculated_Personal_Projection: totalGasCurrentCost(),
                                Difference: totalGasCurrentCost() / (dualFuelBucket[property].Gas_Total_New_Cost),
                                // Difference: (dualFuelBucket[property].Gas_Annual_Usage * standardGasPrice[0]['17.0000']) / (dualFuelBucket[property].Gas_Total_New_Cost),
                                AreFrontPageCalculationCorrect: '',

                                SimilarTariff: dualFuelBucket[property].Gas_Cheapest_Similar_Tariff,
                                SimilarMeter: cheapestSimilarGasMeter,
                                Cheapest_Similar_Projection: totalGasSimilarCost(),
                                Cheapest_Similar_Saving: totalGasSimilarCost() - totalGasCurrentCost(),
                                Cheapest_Similar_Saving_Correct: '',

                                OverallTariff: dualFuelBucket[property].Gas_Cheapest_Overall_Tariff,
                                OverallMeter: cheapestOverallGasMeter,
                                Cheapest_Overall_Projection: totalGasOverallCost(),
                                Cheapest_Overall_Saving: totalGasOverallCost() - totalGasCurrentCost(),
                                Cheapest_Overall_Saving_Correct: '',

                                PresentmentCorrect: '',
                                Incr_Decr_Check: dualFuelBucket[property].INCR_DECR_CHECK,
                                Creative: dualFuelBucket[property].CREATIVE,

                                PassFailUnsure: '',
                                Comments: '',

                            }

                            newDualFuelBucketData.push(gasProofingSheetObject);
                            //Single Gas Object finish here
                        }
                        else {
                            console.log(`Gas Account ${dualFuelBucket[property].Gas_Customer_No} Excluded from calculation, Unable to find Final Price`);
                        }
                    }
                    else {
                        console.log(`Gas Account  ${dualFuelBucket[property].Gas_Customer_No} Excluded from Calculation, Unable to find Payment Method`);
                    }
                }
                else {
                    console.log(` Gas Account  ${dualFuelBucket[property].Gas_Customer_No} Excluded from Calculation,No Tariff available}`);
                }
            }
            else {
                console.log(` Gas Account  ${dualFuelBucket[property].Gas_Customer_No} Excluded, Current Tariff is Fixed`);
            }
        }
        else {
            console.log(`zone missing for Gas A/c ${dualFuelBucket[property].Gas_Customer_No} `); 
        }
    }

    annotate('The we should be able to generate new CSV testing file');
    // // //Below code to write final arrays to file
    if (newDualFuelBucketData.length) {
        const csvFromArrayOfObjects = convertArrayToCSV(newDualFuelBucketData);
        fs.writeFile('CSV Output/trial.csv', csvFromArrayOfObjects, err => {
            if (err) {
                console.log(18, err);
            }
            console.log('Proofing_Sheet_Generated Successfully');
        })
    }
    else {
        console.log('No Proofing_Sheet_Generated Successfully for this Bucket due to all accounts missing required info i.e. zone,tariff,Paymentmthod..etc');
    }
});




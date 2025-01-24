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
    const dualFuelBucket = parse(fs.readFileSync("src/testdata/testbuckets/Pay As You Go - Multi-Rate - Elec Only - Post.csv"), {
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
        // Date: string, Checker: string, PDF: string,
        Account: number, GSP: string,
        Fuel: string, Tariff: string, Meter: string,
        SimilarTariff: string, SimilarMeter: string,
        OverallTariff: string, OverallMeter: string,
        //Marketing_pref: string, Beyond_Eligibility: string, Creative: string, Incr_Decr_Check: string,
        NewSC: number, NewStandingChargeCorrect: string, //PassSc: string,
        NewRate1: number, NewRate1Correct: string,
        NewRate2: any, NewRate2Correct: string,
        NewRate3: any, NewRate3Correct: string,
        NewRate4: any, NewRate4Correct: string,
        OldAnnualCost: number, NewAnnualCost: number, ChangeDifference: number, ChangeAmountCorrect: String,
        PDFPersonalProjection: number, ManualCalculationProjection: number, Difference: number,
        CheapSimilarProjection: number, CheapOverallProjection: number,
        AreFrontPageCalculationCorrect: string,
        RelevantCheapestSaving: number,
        RelavantOverallSaving: number,
        RelevantCheapestTariffCorrect: string,
        ActualCheapestOverallTariffCorrect: string,
        PresentmentCorrect: string,
        PassFail: string,
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
        let customerZone = dualFuelBucket[property].Zone;
        let zoneBasedPriceData = newPriceData.filter(function (el) {
            return el[5] === customerZone;
        });

        //Step 5.1.2: Filtering price file according to Meter type
        if (zoneBasedPriceData.length) {

            //Capturing cheapest similar

            //Capturing current Electric Meter type
            let eMeter: string = '';
            let eleTariffName: string = dualFuelBucket[property].Elec_Tariff_Name;
            if (!eleTariffName.includes('Fixed')) {
                let cheapestSimilarEleMeter = '';
                let cheapestSimilarEle = dualFuelBucket[property].Cheapest_Similar_Tariff;
                let similarChecker: boolean = true;
                let replaceCheapestSimilar = cheapestSimilarEle.replace(/[^a-zA-Z0-9]/g, '');
                cheapestTariffs.forEach((element) => {
                    let ele = element.replace(/[^a-zA-Z0-9]/g, '');
                    if (replaceCheapestSimilar === ele && replaceCheapestSimilar.length === ele.length) {
                        cheapestSimilarEle = element; similarChecker = false;
                    }
                });
                if (similarChecker) {
                    if ((cheapestSimilarEle === 'Simpler Energy' || cheapestSimilarEle === 'Warmer Home Plan' || cheapestSimilarEle === 'Pay As You Go')) { cheapestSimilarEle = 'Standard'; }
                    else {
                        multiRateElectircMeters.forEach((element) => {
                            if (cheapestSimilarEle.includes(element)) { cheapestSimilarEle = element; }
                        });
                    }
                }
                for (const prop in zoneBasedPriceData) {
                    if (cheapestSimilarEle === zoneBasedPriceData[prop][3]) { cheapestSimilarEleMeter = cheapestSimilarEle; }
                    // else { cheapestSimilarEle === ''; }
                }
                let CheapestEleSimilarPriceData: any[] = [];
                if (cheapestSimilarEleMeter !== '') {

                    CheapestEleSimilarPriceData = zoneBasedPriceData.filter(function (el) {
                        return (el[3] === cheapestSimilarEleMeter && el[4] === 'Electric');
                    }
                    );
                }
                //Cheapest Similar calculation complete here
                //Capturing cheapest overall
                let cheapestOverallEleMeter = '';
                let cheapestOverallEle = dualFuelBucket[property].Cheapest_Overall_Tariff;
                let overallChecker = true;
                let replaceCheapestOverall = cheapestOverallEle.replace(/[^a-zA-Z0-9]/g, '');


                cheapestTariffs.forEach((element) => {
                    let ele = element.replace(/[^a-zA-Z0-9]/g, '');
                    if (replaceCheapestOverall === ele && replaceCheapestOverall.length === ele.length) {
                        cheapestOverallEle = element; overallChecker = false;
                    }
                });
                if (overallChecker) {
                    if (cheapestOverallEle === 'Simpler Energy' || cheapestOverallEle === 'Warmer Home Plan' || cheapestOverallEle === 'Pay As You Go') { cheapestOverallEle = 'Standard'; }
                    else {
                        multiRateElectircMeters.forEach((element) => {
                            if (cheapestOverallEle.includes(element)) {
                                cheapestOverallEle = element;
                            }
                        });
                    }
                }
                for (const prop in zoneBasedPriceData) {
                    if (cheapestOverallEle === zoneBasedPriceData[prop][3]) {
                        cheapestOverallEleMeter = cheapestOverallEle;
                    }
                    // else { cheapestOverallEleMeter = ''; }          
                }
                let cheapestEleOverallPriceData: any[] = [];
                if (cheapestOverallEleMeter !== '') {
                    cheapestEleOverallPriceData = zoneBasedPriceData.filter(function (el) {
                        return (el[3] === cheapestOverallEleMeter && el[4] === 'Electric');
                    });
                }
                //Calculation for Cheapest overall complete here

                if (eleTariffName === 'Simpler Energy' || eleTariffName === 'Warmer Home Plan' || eleTariffName === 'Pay As You Go') { eleTariffName = 'Standard'; }
                else {
                    multiRateElectircMeters.forEach((element) => {
                        if (eleTariffName.includes(element)) {
                            eleTariffName = element;
                        }
                    });
                }
                for (const prop in zoneBasedPriceData) {
                    if (eleTariffName === zoneBasedPriceData[prop][3]) {
                        eMeter = eleTariffName;
                    }
                }

                let eleMeterBasedPriceData = [];
                if (eMeter !== '') {
                    eleMeterBasedPriceData = zoneBasedPriceData.filter(function (el) {
                        return (el[3] === eMeter);
                    });
                }
                //Capturing for current tarriff complete here
                //Now capturing new price based on the payment method
                if (eleMeterBasedPriceData.length) {
                    //Capturing cheapest similar and overall  prices based on the payment method
                    /* as per the current logic if customer is paying by prepayment than we should not offer ondemand or dd as payment method and cheapest similar
                    and overall,if cutomer is on demand than cheapest similar and overall would be direct debit, if customer current pay method is DD than cheapest
                    similar and overall will be DD*/
                    const elePaymentMethod = dualFuelBucket[property].Elec_Payment_Method;
                    const cheapEleSimilarPayMethod = (dualFuelBucket[property].Cheapest_Similar_Tariff);
                    const cheapEleOverallPayMethod = (dualFuelBucket[property].Cheapest_Overall_Tariff);

                    let cheapestSimilarPaymentMethod = '';
                    if (cheapEleSimilarPayMethod.includes('Pay As You Go')) {
                        cheapestSimilarPaymentMethod = 'Prepayment';
                    }
                    else { cheapestSimilarPaymentMethod = 'Direct Debit'; }
                    // if (elePaymentMethod !== 'Prepayment') { cheapestSimilarPaymentMethod = 'Direct Debit', cheapestOverallPaymentMethod = 'Direct Debit'; }
                    // else { cheapestSimilarPaymentMethod = 'Prepayment'; cheapestOverallPaymentMethod = 'Prepayment'; }
                    let cheapestOverallPaymentMethod = '';
                    if (cheapEleOverallPayMethod.includes('Pay As You Go')) {
                        cheapestOverallPaymentMethod = 'Prepayment';
                    }
                    else { cheapestOverallPaymentMethod = 'Direct Debit'; }

                    //getting final prices  for cheapest similar
                    let finalCheapestSimilarData = CheapestEleSimilarPriceData.filter(function (el) {
                        return el[10] === cheapestSimilarPaymentMethod;
                    });
                    //getting final prices for cheapet overall 
                    let finalCheapestOverallData = cheapestEleOverallPriceData.filter(function (el) {
                        return el[10] === cheapestOverallPaymentMethod;
                    });
                    //getting prices for current tarrif

                    let elePayMethod = '';
                    for (const prop in eleMeterBasedPriceData) {
                        if (elePaymentMethod === eleMeterBasedPriceData[prop][10]) {
                            elePayMethod = elePaymentMethod;
                        }
                    }

                    let eleFinalPriceData = eleMeterBasedPriceData.filter(function (el) {
                        return el[10] === elePayMethod;
                    });

                    if (eleFinalPriceData.length) {
                        //All calculation should go here
                        const standardElectricPrice = eleFinalPriceData.filter(newPrice => newPrice[4] === 'Electric');

                        if (standardElectricPrice.length) {
                            /*const ePass = () => {
                                if (Number(dualFuelBucket[property].Elec_New_Stdg_Chrg).toFixed(4) === Number(standardElectricPrice[0]['13.0000']).toFixed(4)) {
                                    return 'Pass';
                                }
                                else {
                                    return 'Fail';
                                }
                            }*/

                            let stMeter = standardElectricPrice[0][3];//this would be actual eMeter for this customer                         
                            let switchMeterDecider = '';
                            let meterChecker = true;
                            let returnValue = 0;
                            standardMeters.forEach((element) => {
                                if (element === stMeter) { switchMeterDecider = 'Standard'; meterChecker = false; }
                            });
                            if (meterChecker === true) {
                                twoRateMeters.forEach((element) => {
                                    if (element === stMeter) { switchMeterDecider = 'TwoRate'; meterChecker = false; }
                                });
                            }
                            if (meterChecker === true) {
                                threeRateMeters.forEach((element) => {
                                    if (element === stMeter) { switchMeterDecider = 'ThreeRate'; meterChecker = false; }
                                });
                            }
                            if (meterChecker === true) {
                                if (fourRateMeters === stMeter) { switchMeterDecider = 'FourRate'; meterChecker = false; }

                            }

                            switch (switchMeterDecider) {

                                case 'Standard':
                                    const totalCurrentCost = () => {
                                        let standingCharge = 365 * Number(standardElectricPrice[0]['13.0000']);
                                        let rate1 = Number(standardElectricPrice[0]['17.0000']) * Number(dualFuelBucket[property].Elec_Annual_Usage);
                                        returnValue = Number((rate1 + standingCharge).toFixed(2));

                                        //return Math.round((dualFuelBucket[property].Elec_Annual_Usage * standardElectricPrice[0]['17.0000']) + (365 * standardElectricPrice[0]['13.0000']))
                                    }
                                    totalCurrentCost();
                                    break;
                               /* case 'TwoRate':
                                    const totalTwoRateCurrentCost = () => {
                                        let standingCharge = 365 * Number(standardElectricPrice[0]['13.0000']);
                                        let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                        let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                        let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                        let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                        let anytimeCost = anytimeUsage * standardElectricPrice[0]['17.0000'];
                                        let peakTimeCost = peakUsage * standardElectricPrice[0]['17.0000'];
                                        let offPeakCost = offPeakUsage * standardElectricPrice[0]['20.0000'];
                                        let heatingCost = heatingUsage * standardElectricPrice[0]['20.0000'];
                                        returnValue = Number((anytimeCost + peakTimeCost + offPeakCost + heatingCost + standingCharge).toFixed(2));

                                    }
                                    totalTwoRateCurrentCost();
                                    break;
                                case 'ThreeRate':
                                    const totalThreeRateCurrentCost = () => {
                                        let standingCharge = 365 * Number(standardElectricPrice[0]['13.0000']);
                                        let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                        let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                        let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                        let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                        let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                        let anytimeCost = anytimeUsage * standardElectricPrice[0]['17.0000'];
                                        let peakTimeCost; let offPeakCost;
                                        if (standardElectricPrice[0]['7'] === 'Heatwise 3 Rate') {
                                            peakTimeCost = peakUsage * standardElectricPrice[0]['20.0000'];
                                            offPeakCost = offPeakUsage * standardElectricPrice[0]['23.0000'];
                                        }
                                        else {
                                            peakTimeCost = peakUsage * standardElectricPrice[0]['17.0000'];
                                            offPeakCost = offPeakUsage * standardElectricPrice[0]['20.0000'];
                                        }
                                        let eveWeekendCost = eveWeekendUsage * standardElectricPrice[0]['20.0000'];
                                        let heatingCost = heatingUsage * standardElectricPrice[0]['23.0000'];
                                        returnValue = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));

                                    }
                                    totalThreeRateCurrentCost();
                                    break;
                                case 'FourRate':
                                    const totalFourRateCurrentCost = () => {
                                        let standingCharge = 365 * Number(standardElectricPrice[0]['13.0000']);
                                        let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                        let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                        let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                        let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                        let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                        let anytimeCost = anytimeUsage * standardElectricPrice[0]['17.0000'];
                                        let peakTimeCost = peakUsage * standardElectricPrice[0]['17.0000'];
                                        let offPeakCost = offPeakUsage * standardElectricPrice[0]['20.0000'];
                                        let eveWeekendCost = eveWeekendUsage * standardElectricPrice[0]['23.0000'];
                                        let heatingCost = heatingUsage * standardElectricPrice[0]['26.0000'];
                                        returnValue = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));
                                    }
                                    totalFourRateCurrentCost();
                                    break;
                                    */
                                default:
                            }
                            let similarMeter = '';
                            let similarReturnTotalCost = 0;
                            let similarSwitchMeterDecider = '';
                            if (finalCheapestSimilarData.length) {
                                similarMeter = finalCheapestSimilarData[0][3];//This would be actual similar meter for this customer                               
                                //let similarSwitchMeterDecider = '';
                                let SimilarMeterChecker = true;
                                //  let returnValue = 0;
                                standardMeters.forEach((element) => {
                                    if (element === similarMeter) { ; similarSwitchMeterDecider = 'Standard'; SimilarMeterChecker = false; }
                                });
                                if (SimilarMeterChecker === true) {
                                    twoRateMeters.forEach((element) => {
                                        if (element === similarMeter) { similarSwitchMeterDecider = 'TwoRate'; SimilarMeterChecker = false; }
                                    });
                                }
                                if (SimilarMeterChecker === true) {
                                    threeRateMeters.forEach((element) => {
                                        if (element === similarMeter) { similarSwitchMeterDecider = 'ThreeRate'; SimilarMeterChecker = false; }
                                    });
                                }
                                if (SimilarMeterChecker === true) {
                                    if (fourRateMeters === similarMeter) { similarSwitchMeterDecider = 'FourRate'; SimilarMeterChecker = false; }

                                }
                                switch (similarSwitchMeterDecider) {
                                    case 'Standard':
                                        const totalCheapestSimilarCost = () => {
                                            if (finalCheapestSimilarData.length) {
                                                let standingCharge = 365 * Number(finalCheapestSimilarData[0]['13.0000']);
                                                let rate1 = Number(finalCheapestSimilarData[0]['17.0000']) * Number(dualFuelBucket[property].Elec_Annual_Usage);
                                                similarReturnTotalCost = Number((rate1 + standingCharge).toFixed(2));
                                            } else { similarReturnTotalCost = 0; }
                                        }
                                        totalCheapestSimilarCost();
                                        break;
                                    /*case 'TwoRate':
                                        const totalCheapestSimilarTwoRateCost = () => {
                                            if (finalCheapestSimilarData.length) {
                                                let standingCharge = 365 * Number(finalCheapestSimilarData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestSimilarData[0]['17.0000'];
                                                let peakTimeCost = peakUsage * finalCheapestSimilarData[0]['17.0000'];
                                                let offPeakCost = offPeakUsage * finalCheapestSimilarData[0]['20.0000'];
                                                let heatingCost = heatingUsage * finalCheapestSimilarData[0]['20.0000'];
                                                similarReturnTotalCost = Number((anytimeCost + peakTimeCost + offPeakCost + heatingCost + standingCharge).toFixed(2));
                                            } else { similarReturnTotalCost = 0; }
                                        }
                                        totalCheapestSimilarTwoRateCost();
                                        break;
                                    case 'ThreeRate':
                                        const totalCheapestSimilarThreeRateCost = () => {
                                            if (finalCheapestSimilarData.length) {
                                                let standingCharge = 365 * Number(finalCheapestSimilarData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestSimilarData[0]['17.0000'];
                                                let peakTimeCost; let offPeakCost;
                                                if (finalCheapestSimilarData[0]['7'] === 'Heatwise 3 Rate') {
                                                    peakTimeCost = peakUsage * finalCheapestSimilarData[0]['20.0000'];
                                                    offPeakCost = offPeakUsage * finalCheapestSimilarData[0]['23.0000'];
                                                }
                                                else {
                                                    peakTimeCost = peakUsage * finalCheapestSimilarData[0]['17.0000'];
                                                    offPeakCost = offPeakUsage * finalCheapestSimilarData[0]['20.0000'];
                                                }
                                                let eveWeekendCost = eveWeekendUsage * finalCheapestSimilarData[0]['20.0000'];
                                                let heatingCost = heatingUsage * finalCheapestSimilarData[0]['23.0000'];
                                                similarReturnTotalCost = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));
                                            } else { similarReturnTotalCost = 0; }
                                        }
                                        totalCheapestSimilarThreeRateCost();
                                        break;
                                    case 'FourRate':
                                        const totalCheapestSimilarFourRateCost = () => {
                                            if (finalCheapestSimilarData.length) {
                                                let standingCharge = 365 * Number(finalCheapestSimilarData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestSimilarData[0]['17.0000'];
                                                let peakTimeCost = peakUsage * finalCheapestSimilarData[0]['17.0000'];
                                                let offPeakCost = offPeakUsage * finalCheapestSimilarData[0]['20.0000'];
                                                let eveWeekendCost = eveWeekendUsage * finalCheapestSimilarData[0]['23.0000'];
                                                let heatingCost = heatingUsage * finalCheapestSimilarData[0]['26.0000'];
                                                similarReturnTotalCost = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));
                                            } else { similarReturnTotalCost = 0; }
                                        }
                                        totalCheapestSimilarFourRateCost();
                                        break;
                                        */
                                    default:
                                }
                            }
                            let overallMeter = '';
                            let returnOverallValue = 0;
                            if (finalCheapestOverallData.length) {
                                overallMeter = finalCheapestOverallData[0][3];//This would be actual overall meter for this customer                                                        
                                let overallSwitchMeterDecider = '';
                                let overallMeterChecker = true;

                                standardMeters.forEach((element) => {
                                    if (element === overallMeter) { overallSwitchMeterDecider = 'Standard'; overallMeterChecker = false; }
                                });
                                if (overallMeterChecker === true) {
                                    twoRateMeters.forEach((element) => {
                                        if (element === overallMeter) { overallSwitchMeterDecider = 'TwoRate'; overallMeterChecker = false; }
                                    });
                                }
                                if (overallMeterChecker === true) {
                                    threeRateMeters.forEach((element) => {
                                        if (element === overallMeter) { overallSwitchMeterDecider = 'ThreeRate'; overallMeterChecker = false; }
                                    });
                                }
                                if (overallMeterChecker === true) {
                                    if (fourRateMeters === overallMeter) { overallSwitchMeterDecider = 'FourRate'; overallMeterChecker = false; }
                                }
                                switch (overallSwitchMeterDecider) {
                                    case 'Standard':
                                        const totalCheapestOverallCost = () => {
                                            if (finalCheapestOverallData.length) {
                                                let standingCharge = 365 * Number(finalCheapestOverallData[0]['13.0000']);
                                                let rate1 = Number(finalCheapestOverallData[0]['17.0000']) * Number(dualFuelBucket[property].Elec_Annual_Usage);
                                                returnOverallValue = Number((rate1 + standingCharge).toFixed(2));
                                            }
                                            else { returnOverallValue = 0; }
                                        }
                                        totalCheapestOverallCost();
                                        break;
                                   /* case 'TwoRate':
                                        const totalCheapestOverallTwoRateCost = () => {
                                            if (finalCheapestOverallData.length) {
                                                let standingCharge = 365 * Number(finalCheapestOverallData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestOverallData[0]['17.0000'];
                                                let peakTimeCost = peakUsage * finalCheapestOverallData[0]['17.0000'];
                                                let offPeakCost = offPeakUsage * finalCheapestOverallData[0]['20.0000'];
                                                let heatingCost = heatingUsage * finalCheapestOverallData[0]['20.0000'];
                                                returnOverallValue = Number((anytimeCost + peakTimeCost + offPeakCost + heatingCost + standingCharge).toFixed(2));
                                            }
                                            else { returnOverallValue = 0; }
                                        }
                                        totalCheapestOverallTwoRateCost();
                                        break;
                                    case 'ThreeRate':
                                        const totalCheapestOverallThreeRateCost = () => {
                                            if (finalCheapestOverallData.length) {
                                                let standingCharge = 365 * Number(finalCheapestOverallData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestOverallData[0]['17.0000'];
                                                let peakTimeCost; let offPeakCost;
                                                if (finalCheapestOverallData[0]['7'] === 'Heatwise 3 Rate') {
                                                    peakTimeCost = peakUsage * finalCheapestOverallData[0]['20.0000'];
                                                    offPeakCost = offPeakUsage * finalCheapestOverallData[0]['23.0000'];
                                                }
                                                else {
                                                    peakTimeCost = peakUsage * finalCheapestOverallData[0]['17.0000'];
                                                    offPeakCost = offPeakUsage * finalCheapestOverallData[0]['20.0000'];
                                                }
                                                let eveWeekendCost = eveWeekendUsage * finalCheapestOverallData[0]['20.0000'];
                                                let heatingCost = heatingUsage * finalCheapestOverallData[0]['23.0000'];
                                                returnOverallValue = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));
                                            }
                                            else { returnOverallValue = 0; }
                                        }
                                        totalCheapestOverallThreeRateCost();
                                        break;
                                    case 'FourRate':
                                        const totalCheapestOverallFourRateCost = () => {
                                            if (finalCheapestOverallData.length) {
                                                let standingCharge = 365 * Number(finalCheapestOverallData[0]['13.0000']);
                                                let anytimeUsage = Number(dualFuelBucket[property].Anytime_Consumption);
                                                let peakUsage = Number(dualFuelBucket[property].Peak_Consumption);
                                                let offPeakUsage = Number(dualFuelBucket[property].OffPeak_Consumption);
                                                let heatingUsage = Number(dualFuelBucket[property].Heating_Consumption);
                                                let eveWeekendUsage = Number(dualFuelBucket[property].Evening_And_Weekend_Consumption);
                                                let anytimeCost = anytimeUsage * finalCheapestOverallData[0]['17.0000'];
                                                let peakTimeCost = peakUsage * finalCheapestOverallData[0]['17.0000'];
                                                let offPeakCost = offPeakUsage * finalCheapestOverallData[0]['20.0000'];
                                                let eveWeekendCost = eveWeekendUsage * finalCheapestOverallData[0]['23.0000'];
                                                let heatingCost = heatingUsage * finalCheapestOverallData[0]['26.0000'];
                                                returnOverallValue = Number((anytimeCost + peakTimeCost + offPeakCost + eveWeekendCost + heatingCost + standingCharge).toFixed(2));
                                            }
                                            else { returnOverallValue = 0; }
                                        }
                                        totalCheapestOverallFourRateCost();
                                        break;
                                        */
                                    default:

                                }
                            }

                            const eleProofingSheetObject: ProofingObject & { [key: string]: any } = {
                                // Date: '', Checker: '', PDF: '',
                                Account: dualFuelBucket[property].Elec_Customer_No,
                                GSP: dualFuelBucket[property].Zone_1,
                                Fuel: 'Electric',
                                Tariff: dualFuelBucket[property].Elec_Tariff_Name,
                                Meter: standardElectricPrice[0]['3'],
                                SimilarTariff: dualFuelBucket[property].Cheapest_Similar_Tariff,
                                // SimilarMeter: finalCheapestSimilarData[0]['3'],
                                SimilarMeter: similarMeter,
                                OverallTariff: dualFuelBucket[property].Cheapest_Overall_Tariff,
                                //  OverallMeter: finalCheapestOverallData[0]['3'],
                                OverallMeter: overallMeter,
                                // Marketing_pref: dualFuelBucket[property].Marketing_pref,
                                //Beyond_Eligibility: dualFuelBucket[property].Beyond_Eligibility,
                                // Creative: dualFuelBucket[property].CREATIVE,
                                // Incr_Decr_Check: dualFuelBucket[property].INCR_DECR_CHECK,


                                NewSC: dualFuelBucket[property].Elec_New_Stdg_Chrg, NewStandingChargeCorrect: standardElectricPrice[0]['13.0000'],
                                // PassSc: ePass(),
                                NewRate1: dualFuelBucket[property].Elec_New_Unit_1_Inc_Vat, NewRate1Correct: standardElectricPrice[0]['17.0000'],
                                NewRate2: dualFuelBucket[property].Elec_New_Unit_2_Inc_Vat, NewRate2Correct: standardElectricPrice[0]['20.0000'],
                                NewRate3: dualFuelBucket[property].Elec_New_Unit_3_Inc_VAT, NewRate3Correct: standardElectricPrice[0]['23.0000'],
                                NewRate4: dualFuelBucket[property].Elec_New_Unit_4_Inc_VAT, NewRate4Correct: standardElectricPrice[0]['26.0000'],

                                OldAnnualCost: dualFuelBucket[property].Elec_Total_Old_Cost,
                                NewAnnualCost: dualFuelBucket[property].Elec_Total_New_Cost,
                                ChangeDifference: Number(dualFuelBucket[property].Elec_Total_New_Cost - dualFuelBucket[property].Elec_Total_Old_Cost),
                                ChangeAmountCorrect: '',
                                PDFPersonalProjection: dualFuelBucket[property].Elec_Total_New_Cost,
                                ManualCalculationProjection: returnValue,
                                Difference: (dualFuelBucket[property].Elec_Annual_Usage * standardElectricPrice[0]['17.0000'] / dualFuelBucket[property].Elec_Total_New_Cost),

                                CheapSimilarProjection: similarReturnTotalCost,
                                CheapOverallProjection: returnOverallValue,

                                AreFrontPageCalculationCorrect: '',
                                RelevantCheapestSaving: returnValue - similarReturnTotalCost,
                                RelevantCheapestTariffCorrect: '',
                                RelavantOverallSaving: returnValue - returnOverallValue,
                                ActualCheapestOverallTariffCorrect: '',
                                PresentmentCorrect: '',
                                PassFail: '',
                                Comments: '',

                            }
                            newDualFuelBucketData.push(eleProofingSheetObject);
                            //Single Ele Object finish here
                        }

                        else {
                            console.log(` Electric Account ${dualFuelBucket[property].Elec_Customer_No} Excluded from calculation, Unable to find Final Price`);
                        }
                    }
                    else {
                        console.log(`Electirc Account ${dualFuelBucket[property].Elec_Customer_No} Excluded from Calculation, Unable to find Payment Method`);
                    }
                }
                else {
                    console.log(` Electirc Account  ${dualFuelBucket[property].Elec_Customer_No} Excluded from Calculation, No Tariff available`);
                }
            }
            else {
                console.log(` Electric Account ${dualFuelBucket[property].Elec_Customer_No} Excluded from calculation,Currrent Tariff is Fixed`);;
            }
            //Capturing cheapest similar gas prices         
        }
            
        else {
            console.log(`zone missing for Ele A/c ${dualFuelBucket[property].Elec_Customer_No} `);
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
            console.log('CSV file created');
        })
    }
    else {
        console.log('No CSV File generated for this Bucket due to all accounts missing required info i.e. zone,tariff,Paymentmthod..etc');
    }
});




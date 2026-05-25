export const AGE_GENDER_COLORS = [
  '#E2725B', '#71AEC7', '#FFC300', '#7676EB', '#FF80B4',
  '#E7AFA4', '#AFCDDA', '#F6D877', '#B2B2EC', '#F1D2DF',
];

export const AGE_GENDER_LABELS = [
  'Male 0-2', 'Male 3-12', 'Male 13-21', 'Male 22-35', 'Male 35+',
  'Female 0-2', 'Female 3-12', 'Female 13-21', 'Female 22-35', 'Female 35+',
];

export const AGE_GENDER_SERIES_KEYS = [
  'm02', 'm312', 'm1321', 'm2235', 'm35p',
  'f02', 'f312', 'f1321', 'f2235', 'f35p',
];

export interface VisitingHoursDataPoint {
  hour: string;
  m02: number; m312: number; m1321: number; m2235: number; m35p: number;
  f02: number; f312: number; f1321: number; f2235: number; f35p: number;
}

export interface MonthlyTrendDataPoint {
  month: string;
  male: number;
  female: number;
}

export interface PasserbyTrendDataPoint {
  month: string;
  passerby: number;
  entryExit: number;
}

export interface HourlyConversionDataPoint {
  hour: string;
  passerby: number;
  entryExit: number;
  conversionRate: number;
}

export interface StoreConversionData {
  name: string;
  rate: number;
}

export interface StoreVisitorData {
  name: string;
  visitors: number;
  breakdown: number[];
}

export const VISITING_HOURS_DATA: VisitingHoursDataPoint[] = [
  { hour: '9am',  m02: 8,  m312: 18, m1321: 25, m2235: 42, m35p: 22, f02: 6,  f312: 14, f1321: 20, f2235: 35, f35p: 18 },
  { hour: '10am', m02: 12, m312: 28, m1321: 38, m2235: 62, m35p: 32, f02: 10, f312: 22, f1321: 30, f2235: 52, f35p: 26 },
  { hour: '11am', m02: 18, m312: 42, m1321: 55, m2235: 89, m35p: 45, f02: 14, f312: 33, f1321: 44, f2235: 74, f35p: 37 },
  { hour: '12pm', m02: 25, m312: 58, m1321: 76, m2235: 124, m35p: 62, f02: 20, f312: 46, f1321: 61, f2235: 103, f35p: 51 },
  { hour: '1pm',  m02: 30, m312: 70, m1321: 92, m2235: 150, m35p: 75, f02: 24, f312: 56, f1321: 74, f2235: 125, f35p: 62 },
  { hour: '2pm',  m02: 28, m312: 65, m1321: 85, m2235: 138, m35p: 70, f02: 22, f312: 52, f1321: 68, f2235: 115, f35p: 58 },
  { hour: '3pm',  m02: 22, m312: 52, m1321: 68, m2235: 110, m35p: 55, f02: 18, f312: 41, f1321: 54, f2235: 91,  f35p: 46 },
  { hour: '4pm',  m02: 16, m312: 38, m1321: 50, m2235: 82,  m35p: 41, f02: 13, f312: 30, f1321: 40, f2235: 68,  f35p: 34 },
  { hour: '5pm',  m02: 10, m312: 24, m1321: 32, m2235: 52,  m35p: 26, f02: 8,  f312: 19, f1321: 26, f2235: 43,  f35p: 22 },
];

export const MONTHLY_TREND_DATA: MonthlyTrendDataPoint[] = [
  { month: 'Jun 25', male: 845000,  female: 632000 },
  { month: 'Jul 25', male: 912000,  female: 684000 },
  { month: 'Aug 25', male: 978000,  female: 732000 },
  { month: 'Sep 25', male: 892000,  female: 668000 },
  { month: 'Oct 25', male: 1045000, female: 783000 },
  { month: 'Nov 25', male: 1134000, female: 850000 },
  { month: 'Dec 25', male: 1198000, female: 898000 },
  { month: 'Jan 26', male: 876000,  female: 656000 },
  { month: 'Feb 26', male: 923000,  female: 692000 },
  { month: 'Mar 26', male: 1067000, female: 800000 },
  { month: 'Apr 26', male: 1145000, female: 858000 },
  { month: 'May 26', male: 1089000, female: 816000 },
];

export const PASSERBY_TREND_DATA: PasserbyTrendDataPoint[] = [
  { month: 'Jun 25', passerby: 22400, entryExit: 11200 },
  { month: 'Jul 25', passerby: 25800, entryExit: 12900 },
  { month: 'Aug 25', passerby: 28600, entryExit: 14300 },
  { month: 'Sep 25', passerby: 26400, entryExit: 13200 },
  { month: 'Oct 25', passerby: 31200, entryExit: 15600 },
  { month: 'Nov 25', passerby: 35600, entryExit: 17800 },
  { month: 'Dec 25', passerby: 42800, entryExit: 21400 },
  { month: 'Jan 26', passerby: 24600, entryExit: 12300 },
  { month: 'Feb 26', passerby: 27200, entryExit: 13600 },
  { month: 'Mar 26', passerby: 33400, entryExit: 16700 },
  { month: 'Apr 26', passerby: 37800, entryExit: 18900 },
  { month: 'May 26', passerby: 35200, entryExit: 17600 },
];

export const HOURLY_CONVERSION_DATA: HourlyConversionDataPoint[] = [
  { hour: '8am',  passerby: 1200,  entryExit: 480,  conversionRate: 40 },
  { hour: '9am',  passerby: 2800,  entryExit: 980,  conversionRate: 35 },
  { hour: '10am', passerby: 4200,  entryExit: 1260, conversionRate: 30 },
  { hour: '11am', passerby: 6800,  entryExit: 1836, conversionRate: 27 },
  { hour: '12pm', passerby: 9400,  entryExit: 2350, conversionRate: 25 },
  { hour: '1pm',  passerby: 12600, entryExit: 2898, conversionRate: 23 },
  { hour: '2pm',  passerby: 14800, entryExit: 3256, conversionRate: 22 },
  { hour: '3pm',  passerby: 13200, entryExit: 2904, conversionRate: 22 },
  { hour: '4pm',  passerby: 10800, entryExit: 2376, conversionRate: 22 },
  { hour: '5pm',  passerby: 8400,  entryExit: 1932, conversionRate: 23 },
  { hour: '6pm',  passerby: 6200,  entryExit: 1488, conversionRate: 24 },
  { hour: '7pm',  passerby: 3400,  entryExit: 850,  conversionRate: 25 },
];

export const STORE_CONVERSION_DATA: StoreConversionData[] = [
  { name: 'Marina Bay Sands', rate: 18.2 },
  { name: 'Orchard Central',  rate: 16.8 },
  { name: 'VivoCity',          rate: 15.3 },
  { name: 'Bugis Junction',   rate: 14.1 },
  { name: 'Tampines Mall',    rate: 12.7 },
  { name: 'Jurong Point',     rate: 11.4 },
  { name: 'Northpoint City',  rate: 10.2 },
  { name: 'Causeway Point',   rate: 9.1  },
];

export const STORE_VISITOR_DATA: StoreVisitorData[] = [
  { name: 'Marina Bay Sands', visitors: 15234, breakdown: [3, 8, 15, 28, 10, 2, 6, 12, 11, 5] },
  { name: 'Orchard Central',  visitors: 12841, breakdown: [2, 7, 14, 30,  9, 2, 5, 11, 14, 6] },
  { name: 'VivoCity',          visitors: 11567, breakdown: [4, 9, 16, 25,  8, 3, 7, 13, 10, 5] },
  { name: 'Bugis Junction',   visitors: 10234, breakdown: [3, 8, 15, 27, 10, 2, 6, 12, 12, 5] },
  { name: 'Tampines Mall',    visitors: 9876,  breakdown: [3, 7, 14, 26, 11, 2, 6, 12, 13, 6] },
  { name: 'Jurong Point',     visitors: 8543,  breakdown: [4, 8, 15, 25,  9, 3, 6, 13, 11, 6] },
  { name: 'Northpoint City',  visitors: 7891,  breakdown: [3, 8, 16, 26, 10, 2, 6, 12, 11, 6] },
  { name: 'Causeway Point',   visitors: 6234,  breakdown: [4, 9, 15, 25,  9, 3, 7, 13, 10, 5] },
];

export const FOOTFALL_BREAKDOWN = [3, 8, 15, 28, 10, 2, 6, 12, 11, 5];
export const PASSERBY_BREAKDOWN = [4, 9, 16, 25,  8, 3, 7, 13, 10, 5];

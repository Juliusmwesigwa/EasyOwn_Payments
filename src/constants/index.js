export const BBA_API_BASE_URL = "https://bba-api-st4h.onrender.com/api";//"https://api.bballiance.africa/api";
export const EASY_API_BASE_URL = "https://api.easyown.africa/app1/api";
export const API_BASE_URL2 = "http://192.168.116.150:3001/api";
export const EASYOWN_FLW_PUBLIC_KEY ='FLWPUBK-a99ce1b2939759dcb5238497d65d9bb2-X';
export const BBA_FLW_PUBLIC_KEY='FLWPUBK-08e9c7ac31e1830289e28e4d0276b19a-X'

//Change this to true or false to switch between BBA and EasyOwn
const EasyOwnON = true
export const paymenttitle=EasyOwnON ===true? 'EasyOwn Payments': 'BBA Payments'
export const paymentslogo= EasyOwnON ===true? 'https://i.imgur.com/SvgAx2k.jpg': 'https://i.imgur.com/yDCyp68.png'
export const paymentdescription = EasyOwnON ===true? 'EasyOwn Device Payment':'BBA Device Payment'
export const paymentRedirectUrl =EasyOwnON ===true?"https://pay.easyown.africa": "https://pay.bballiance.africa"
export const EasyOwnONStatus =EasyOwnON;
export const API_BASE_URL = EasyOwnON ==true?EASY_API_BASE_URL:BBA_API_BASE_URL
export const DOMAIN_MAIL = EasyOwnON ===true?'@easyown.africa':'@bballiance.africa'

export const FLW_PUBLIC_KEY=EasyOwnON ===true? EASYOWN_FLW_PUBLIC_KEY:BBA_FLW_PUBLIC_KEY
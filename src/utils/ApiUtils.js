import { API_BASE_URL } from "../constants";

const request = (options) => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const defaults = { headers: headers };
    options = Object.assign({}, defaults, options);
    return fetch(options.url, options)
        .then(response =>
            response.json().then(json => {
                if (!response.ok) {
                    return Promise.reject(json);
                }
                return json;
            })
        );
};

const collection = async (options) => {
    const headers = new Headers({ 'Accept': '*/* ',
    'Content-Type': 'application/json',
    'X-Country': 'UG',
    'X-Currency': 'UGX',
    'Authorization': 'Bearer UC*******2w' });
    const defaults = { headers: headers };
    options = Object.assign({}, defaults, options);
    const response = await fetch(options.url, options);
    const json = await response.json();
    if (!response.ok) {
        return Promise.reject(json);
    }
    return json;
};

export function getCustomerPaymentDetails(toPayLoad) {
    return request({
        url: API_BASE_URL + "/customers/getCustomerPaymentDetailsx",
        method: 'POST',
        body: JSON.stringify(toPayLoad)
    });
}


//Test
export function initiateCustomerCollection(toPayLoad) {
    return request({
        url: "https://openapiuat.airtel.africa/merchant/v1/payments/",
        method: 'POST',
        body: JSON.stringify(toPayLoad)
    });
}

export function postCustomerCollection(toPayLoad){
    return request({
        url: "https://pay.easyown.africa/apps/V1/api/portfolio/requestPaymentFromWeb",
        method: 'POST',
        body: JSON.stringify(toPayLoad)
    });
}

export function checkTransactionStatusInhouse(toPayLoad){
    return request({
        url: "https://pay.easyown.africa/apps/V1/api/portfolio/checkTransactionStatusInhouse",
        method: 'POST',
        body: JSON.stringify(toPayLoad)
    });
}

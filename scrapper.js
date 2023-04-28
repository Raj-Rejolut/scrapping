const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra')
const fs = require("fs")

// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const https = require('https');
const qs = require('querystring');
const { readFileSync, writeFileSync } = require('fs');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const writeToFile = async (fileName, data) => {
    const filePath = `./results/${fileName}`;
    const existingData = readFileSync(filePath);
    const obj = JSON.parse(existingData);

    obj[new Date().toDateString()] = data;
    const json = JSON.stringify(obj);
    writeFileSync(filePath, json, { flag: 'w+' });
};

//Pending It has country and rate
const alansariExchangeRateScrape = async () => {
    console.log('Al Ansari Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: true });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('https://alansariexchange.com/#nogo', {
        waitUntil: 'load',
        timeout: 60000,
    });

    await page.waitForSelector('.slick-track', { timeout: 120000 });

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let sliderItems = document.body.querySelectorAll('.item.slick-slide');
        return Object.values(sliderItems)
            .map((x) => ({
                country: x.querySelector('div').classList[1] ?? '',
                rate:
                    x.querySelector('p > strong')?.textContent?.trim() ?? null,
            }))
            .filter((row) => row.country && row.rate);
    });

    await browser.close();

    // await writeToFile('alansari.json', { baseCurrency, rates });
    console.log('Al Ansari Exchange rates extraction completed successfully!', { baseCurrency, rates });
};
// alansariExchangeRateScrape();

//Pending BaseCurrency is BHR
const bfcExchangeRateScrape = async () => {
    console.log('BFC Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: true });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto(
        'https://www.bfc.com.bh/personal/international-money-transfer/#rates'
    );

    await page.waitForSelector('.cur_content');

    const baseCurrency = 'BHR';

    const rates = await page.evaluate(() => {
        let quotesElement = document.body.querySelectorAll(
            'div > table > tbody > tr'
        );
        return Object.values(quotesElement)
            .map((x) => ({
                currency_code:
                    x
                        .querySelector('.currency_name > .title')
                        ?.textContent?.trim() ?? null,
                credit_to_amount:
                    x.querySelector('td:nth-of-type(2)')?.textContent?.trim() ??
                    null,
                cash_pick_up:
                    x.querySelector('td:nth-of-type(3)')?.textContent?.trim() ??
                    null,
            }))
            .filter((x) => x.currency_code !== null);
    });

    await browser.close();
    // await writeToFile('bfc.json', { baseCurrency, rates });
    console.log('BFC Exchange rates extraction completed successfully!', { baseCurrency, rates });
};
// bfcExchangeRateScrape();

//Pending It has currency name not currecny code
const sharafExchangeRateScrape = async () => {
    console.log('Sharaf Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('http://www.sharafexchange.com/exchange-rates');

    await page.waitForSelector('.table.table-responsive.table-bordered');

    const baseCurrency = 'AED';
    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll(
            '.table.table-responsive.table-bordered tbody tr'
        );
        return Array.from(tableRows, (row) => {
            const columns = row.querySelectorAll('td');
            const [currency, dd_tt, fc_buy, fc_sell] = Array.from(
                columns,
                (column) => column?.innerText
            );
            return {
                currency,
                dd_tt,
                fc_buy,
                fc_sell,
            };
        });
    });

    await browser.close();

    // await writeToFile('sharaf.json', { baseCurrency, rates });
    console.log('Sharaf Exchange rates extraction completed successfully!', { baseCurrency, rates });
};
// sharafExchangeRateScrape();

// Pending unable to get data in console waitForSelector 
const joyalukkasExchangeRateScrape = async () => {
    console.log('Joyalukkas Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: true });
    // scraping logic comes here…
    const homePage = await browser.newPage();
    await homePage.goto('https://www.joyalukkasexchange.com/Index.aspx');
    // scrapping page
    const page = await browser.newPage();
    await page.goto(
        'https://www.joyalukkasexchange.com/CurrencyBoarddetails.aspx?id=25'
    );

    await page.waitForSelector('#ContentPlaceHolder1_grdcurrencydet');

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll('#ContentPlaceHolder1_grdcurrencydet tr');
        return Array.from(document.body.querySelectorAll('#ContentPlaceHolder1_grdcurrencydet tr'), (row) => {
            const columns = row.querySelectorAll('td');
            const [currency, currency_code, bank_sell, cash_buy, cash_sell] =
                Array.from(columns, (column) => column.innerText);
            return {
                currency,
                currency_code,
                bank_sell,
                cash_buy,
                cash_sell,
            };
        });
    });

    await browser.close();

    // await writeToFile('joyalukkas.json', { baseCurrency, rates });
    console.log('Joyalukkas Exchange rates extraction completed successfully!', { baseCurrency, rates });
};
// joyalukkasExchangeRateScrape();

// Done
const luluExchangeRateScrape = async () => {
    console.log('Lulu Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('https://luluexchange.com/services/currency-exchange/');

    await page.waitForSelector('.owl-stage');
    await page.waitForSelector('.owl-item');
    await page.waitForSelector('.ll-card');

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let quotesElement = document.body.querySelectorAll('.owl-item');
        return Object.values(quotesElement).map((x) => ({
            currency_code:
                x
                    .querySelector('.item > .ll-card > div > p')
                    ?.childNodes[1]?.textContent.trim() ?? null,
            rate:
                x.querySelector('.item > .ll-card > div > p > strong')
                    ?.textContent ?? null,
        }));
    });

    await browser.close();

    await writeToFile('lulu.json', { baseCurrency, rates });
    console.log('Lulu Exchange rates extraction completed successfully!');
};

//Done
const alrostamaniExchangeRateScrape = async () => {
    console.log('Al Rostamani Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto(
        'https://www.alrostamaniexchange.com/Pages/CurrencyRates.aspx'
    );

    await page.waitForSelector('#tblCntPage');

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll('#tblCntPage tbody tr');
        return Array.from(tableRows, (row) => {
            const columns = row.querySelectorAll('td');
            const [flag, currency_code, currency, transfer] = Array.from(
                columns,
                (column) => column.innerText
            );
            return {
                currency_code,
                currency,
                transfer,
            };
        });
    });

    await browser.close();

    // await writeToFile('alrostamani.json', { baseCurrency, rates });
    console.log(
        'Al Rostamani Exchange rates extraction completed successfully!', { baseCurrency, rates }
    );
};

//Done
const almuzainiExchangeRateScrape = async () => {
    console.log('Al Muzaini Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('https://www.muzaini.com/ExchangeRates.aspx');

    await page.waitForSelector('#UpdatePanel1');

    const baseCurrency = 'KWD';

    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll(
            '#UpdatePanel1 table tbody tr'
        );
        return Array.from(tableRows, (row) => {
            const columns = row.querySelectorAll('td');
            const [currency_code, currency, cash_buy, cash_sell] = Array.from(
                columns,
                (column) => column.innerText
            );
            return {
                currency_code,
                currency,
                buy: cash_buy,
                sell: cash_sell,
            };
        });
    });

    await browser.close();

    await writeToFile('almuzaini.json', { baseCurrency, rates });
    console.log('Al Muzaini Exchange rates extraction completed successfully!');
};

//Pending It has api call
const alfardanExchangeAPICallData = {
    request_header_cookie:
        'XSRF-TOKEN=eyJpdiI6IkJDb3dGQXdUS2lIMVhUeTZ0cHErR1E9PSIsInZhbHVlIjoiNjdiaVRtbUxIc3pCdDFGZFNLWk13NWVXUktpTW41OExkTjgrcitqUHVxY0RuQnRwclFrZkhaNWVuYUZ0Uk5lZyIsIm1hYyI6IjUzODU2MmIwNDk1ZjUyMTI3YTU5NWI3NjIwYzZmZGI3MGJjZWY1Mzg2MDk4Mzk0MjRjYjM3YzgxN2IyM2I0MDYifQ%3D%3D; botble_session=eyJpdiI6IjFSMGVFVVE4RlhVWkZadWlvVFpIaFE9PSIsInZhbHVlIjoiNUtFUm90Sm1XZFBPZ0Y3UWxURW9ldkRjZkRnRmQvdFgycTBvdjdETkF2MzFKZlRlY1pCUUtnQmdJVTEvdU1YdCIsIm1hYyI6ImRkNDdmZmQxMmQ3YmFhN2RkMDhmMTNkNDY4MjU3YjBiZTdjZTZlZGRhZDAyMTY3ZjhhMzY3ODg3ZDhmMzNkYmEifQ%3D%3D',
    request_body_token: 'C91nckLz6JD5KJ2OHaT8QjzNz64G7iXjRkZHkVLG',
};
// alfardanExchangeAPICallData();

//Pending Same as alfardanExchangeAPICallData showing API does not exist
const alfardanExchangeRateAPI = async () => {
    console.log('Al Fardan Exchange rates extraction started!');
    const apiCallURL = `https://alfardanexchange.com/currency_converter`;
    const host = `https://alfardanexchange.com/`;
    const baseCurrency = 'AED';
    const { data, headers } = await axios.get(`https://alfardanexchange.com/`, { timeout: 60000000 });
    console.log(headers)
    alfardanExchangeAPICallData.request_header_cookie = headers.cms["set-cookie"]
    const currencyCodes = [];
    const axiosRequests = [];
    const $ = cheerio.load(data);

    // meta name="csrf-token" 
    $('[name=csrf-token]').each((i, el) => {
        if (el.attribs.name != "csrf-token") return
        alfardanExchangeAPICallData.request_body_token = el.attribs.content
    })

    $('#will-get > option').each((i, el) => {
        if (i === 0) return;
        const res = $(el).html().trim();
        const newRequest = axios.post(
            apiCallURL,
            {
                _token: alfardanExchangeAPICallData.request_body_token,
                currency: res,
                amount: 1,
                type: 'Cash Rate',
            },
            {
                headers: {
                    Cookie: alfardanExchangeAPICallData.request_header_cookie,
                },
            }
        ).catch(e => { })
        axiosRequests.push(newRequest);
        currencyCodes.push(res);
    });

    const responses = await Promise.all(axiosRequests);
    console.log("got final data\n", responses)
    const rates = responses.map((res, i) => ({
        currency_code: currencyCodes[i],
        rate: res.data,
    }));


    // await writeToFile('alfardan.json', { baseCurrency, rates });
    // console.log('Al Fardan Exchange rates extraction completed successfully!', { baseCurrency, rates });
};
// alfardanExchangeRateAPI();


//Pending It has API call data
const orientExchangeRateAPICallData = {
    request_headers_cookie:
        'PHPSESSID=4bav63k7keo7onfl9m1qkojqh4; twk_idm_key=_H7mToBGm7F-nrxDd_zpL; TawkConnectionTime=0; twk_uuid_5875f3e75e0a9c5f1bae19f6={"uuid":"1.92N2CTWqcb2TQaNQXzfcVhjtSNfVushcIS0jvNd9qtwGjxXtVbqKWz1Onj6NoSmaD5gmdGNb1d7F2hglElRUCeDiGx3lqoQKM031qwfeh1eSm5CWwHV2vworj3uR","version":3,"domain":"orientexchange.in","ts":1680244707426}; __cf_bm=EG4RHAvoLKKobgFxhMiqJicPpKKcw9IvBYTXDu8jS8c-1680244708-0-AaZB6nBHUTx3eMfebrzqhgLgFeghYKXTMBf9fnPXAvilXp8UqE80jm8UIMHl+PxuhsfAhMGKLR32PzKp4lKJL6JTGG33Dik+0tdwin8iP8dKB2/CXnbxjoSq2H9vMbpmxg==',
    request_headers_content_type:
        'application/x-www-form-urlencoded; charset=UTF-8',
};


//Pending same as orientExchangeRateAPICallData
const orientExchangeRateAPI = async () => {
    console.log('Orient Exchange rates extraction started!');
    const baseCurrency = 'INR';
    const apiCallURL = `https://www.orientexchange.in/live_exchange_rates`;
    const host = `https://www.orientexchange.in/foreign-currency`;

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    page.viewport(1920, 1080)
    page.setRequestInterception(true)

    page.on('request', (request) => {
        request.continue()
    })
    page.on('response', async (response) => {
        const request = response.request();
        if (request.url() == apiCallURL) {
            const text = await response.text();
            console.log(typeof text);
            // fs.writeFile("./results/orientExchangeRateAPIRAW.json",text,{mode:'rw+'})
            fs.writeFileSync("./results/orientExchangeRateAPIRAW.json", text)
            console.log("done")
            browser.close()

        }
    })

    await page.goto(host, { timeout: 600000, waitUntil: "domcontentloaded" })
    console.log("page loaded")
    // console.log(await page.content())
    await page.screenshot({ path: 'clicks_map.png' })
    // await page.$$eval('.btn.dropdown-toggle.bs-placeholder.btn-default',async elements => await console.log("elelesadddddddd==========",elements));
    const element = await page.waitForSelector('.btn.dropdown-toggle.bs-placeholder.btn-default');
    // Do something with element...
    await element.click();

    const liIndexToClick = 3; // replace with the index of the li element you want to click on (starting from 0)
    const liSelector = `.dropdown-menu.inner li[data-original-index="${liIndexToClick}"] a`;

    await page.waitForSelector(liSelector);
    await page.click(liSelector);
    // browser.close()
};
// orientExchangeRateAPI();


//Done
const alawnehExchangeRateScrape = async () => {
    console.log('Alawneh Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('https://alawnehexchange.com/en/currency_exchange');

    await page.waitForSelector('#tablefield-wrapper-0');

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll(
            '#tablefield-wrapper-0 table tbody tr'
        );
        return Array.from(tableRows, (row) => {
            const columns = row.querySelectorAll('td');
            const [currency_code, buy, sell, ...rest] = Array.from(
                columns,
                (column) => column.innerText
            );
            return {
                currency_code,
                buy,
                sell,
            };
        });
    });

    await browser.close();

    await writeToFile('alawneh.json', { baseCurrency, rates });
    console.log('Alawneh Exchange rates extraction completed successfully!');
};

//Pending It has API call 
const wallStreetExchangeRateAPI = async () => {
    console.log('Wall Street Fardan Exchange rates extraction started!');
    const { data: currencyList } = await axios.get(
        'https://www.wallstreet.ae/index.php/currency-list?mode=bank_transfer&isAjax=true',
        { httpsAgent }
    );

    const baseCurrency = 'AED';
    const baseAmount = 1;
    const apiCallURL = `https://www.wallstreet.ae/index.php/conversion?base_currency=${baseCurrency}&base_amount=${baseAmount}&is_target=0&base_mode=bank_transfer&isAjax=true&target_currency=`;

    const axiosRequests = [];
    currencyList.data.forEach((curr) => {
        const newRequest = axios.get(apiCallURL + curr.currencyCode, {
            httpsAgent,
        });
        axiosRequests.push(newRequest);
    });

    const responses = await Promise.all(axiosRequests);
    const rates = responses.map((res, i) => ({
        currency_code: currencyList.data[i].currencyCode,
        rate: res.data?.data?.target_amount ?? 0,
    }));

    await writeToFile('wallstreet.json', { baseCurrency, rates });
    console.log(
        'Wall Street Exchange rates extraction completed successfully!'
    );
};

// wallStreetExchangeRateAPI()



//Pending It has API call
const alfardan2ExchangeRateScrape = async () => {
    console.log('Al Fardan Exchange rates extraction started!');

    const res = await axios.get(
        'https://www.alfardanexchange.com.qa/wp-admin/admin-ajax.php?wpml_lang=en&action=crb_get_paginated_currency_rates&currencyId=135&postsPerPage=100&page=1'
    );
    console.log(res.data)
    const rates = res?.data?.data?.rates
        ? Object.values(res.data.data.rates).map(
            ({ currency_code, buy, sell, transfer }) => ({
                currency_code,
                buy,
                sell,
                transfer,
            })
        )
        : [];

    const baseCurrency = 'QAR';

    await writeToFile('alfardan2.json', { baseCurrency, rates });
    console.log('Al Fardan rates extraction completed successfully!');
};
// alfardan2ExchangeRateScrape()

//Pending It has API call
const abusheikhExchangeRateAPI = async () => {
    console.log('Abusheikh Exchange rates extraction started!');
    const { data } = await axios.get(
        'https://abusheikhaex.com/news/currency-exchange-made-simple-4-ways-get-best-rate', { timeout: 600000 }
    );

    const axiosRequests = [];
    const currencyCodes = [];
    const $ = cheerio.load(data);
    const apiCallURL = `https://api.currconv.com/api/v7/convert?apiKey=0600e5fa-87e2-49ad-a07a-043a6a2ee1a7&compact=ultra&q=AED_`;

    $('#to > option').each((i, el) => {
        const res = $(el).attr('value');
        const newRequest = axios.get(apiCallURL + res);
        axiosRequests.push(newRequest);
        currencyCodes.push(res);
    });

    const responses = await Promise.all(axiosRequests);
    const baseCurrency = 'AED';
    const rates = responses.map((res, i) => ({
        currency_code: currencyCodes[i],
        rate: res.data[`AED_${currencyCodes[i]}`] ?? 0,
    }));

    await writeToFile('abusheikh.json', { baseCurrency, rates });
    console.log('Abusheikh rates extraction completed successfully!');
};

//Done
const gccExchangeRateScrape = async () => {
    console.log('GCC Exchange rates extraction started!');

    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto('https://www.gccexchange.com/uae-currency-exchange-rates');

    await page.waitForSelector('#currencyexchangerate');

    const baseCurrency = 'AED';

    const rates = await page.evaluate(() => {
        let tableRows = document.body.querySelectorAll(
            '#currencyexchangerate tbody tr'
        );
        return Array.from(tableRows, (row) => {
            const columns = row.querySelectorAll('td');
            const [currency, currency_code, rate] = Array.from(
                columns,
                (column) => column.innerText
            );
            return {
                currency,
                currency_code,
                rate,
            };
        }).filter((row) => row.currency && row.currency_code && row.rate);
    });

    await browser.close();

    // await writeToFile('gcc.json', { baseCurrency, rates });
    console.log('GCC Exchange rates extraction completed successfully!', { baseCurrency, rates });
};

// const alghurairExchangeRateAPI = async () => {
//     try {
//         const res = await axios.post(
//             'https://alghurairexchange.com/index.php',
//             qs.stringify('from=2&to=313&mode=get_currenecy_form', {
//                 httpsAgent,
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     Cookie: 'my_cookie=Promotion',
//                 },
//             })
//         );
//         console.log('res :', res);
//     } catch (err) {
//         console.error(err);
//     }
// };

// alghurairExchangeRateAPI().then((res) => res);


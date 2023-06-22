const puppeteer = require("puppeteer");
const NaverPriceComparisonExcel = require("./excel_naver_price_comparison");

const wait = async (sec) => {
  let start = Date.now(),
    now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
};

const getShopNameFromSelector = async (page, selector_div, selector_img) => {
  let shop_name = "";

  try {
    await page.waitForSelector(selector_div, { timeout: 1000 });
    shop_name = await page.$eval(
      selector_div,
      (element) => element.textContent
    );
  } catch (err1) {
    try {
      await page.waitForSelector(selector_img, { timeout: 1000 });
      shop_name = await page.$eval(selector_img, (element) =>
        element.getAttribute("alt")
      );
    } catch (err2) {}
  }

  return shop_name;
};

const getTextFromSelector = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return await page.$eval(selector, (element) => element.textContent);
  } catch (err) {
    return "";
  }
};

const getLinkFromSelector = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return await page.$eval(selector, (element) =>
      element.getAttribute("href")
    );
  } catch (err) {
    return "";
  }
};

const getMinimumPrices = async (page) => {
  let isContinue = true;
  let prices = [];

  for (let i = 0; i < 20; i += 1) {
    const selector_shop_text = `#section_price > div.productList_seller_wrap__FZtUS > ul > li:nth-child(${
      i + 1
    }) > div > div.productList_mall__JtWmC > a > span:nth-child(1)`;
    const selector_shop_img = `#section_price > div.productList_seller_wrap__FZtUS > ul > li:nth-child(${
      i + 1
    }) > div > div.productList_mall__JtWmC > a > img`;
    const selector_minimum_price = `#section_price > div.productList_seller_wrap__FZtUS > ul > li:nth-child(${
      i + 1
    }) > div > div.productList_price__2eGt4 > a > span > em`;
    const selector_delivery_price = `#section_price > div.productList_seller_wrap__FZtUS > ul > li:nth-child(${
      i + 1
    }) > div > div.productList_price__2eGt4 > div`;
    const selector_link = `#section_price > div.productList_seller_wrap__FZtUS > ul > li:nth-child(${
      i + 1
    }) > div > div.productList_product__b2cSY > a`;

    try {
      const shopName = await getShopNameFromSelector(
        page,
        selector_shop_text,
        selector_shop_img
      );
      const minPrice = await getTextFromSelector(page, selector_minimum_price);
      const deliveryPrice = await getTextFromSelector(
        page,
        selector_delivery_price
      );
      const link = await getLinkFromSelector(page, selector_link);

      if (!shopName) {
        isContinue = false;
        break;
      }

      prices.push({
        shopName,
        minPrice,
        deliveryPrice,
        link,
      });
      console.log(`${i}번째 가게 : `, shopName, minPrice, deliveryPrice, link);
    } catch (err) {
      isContinue = false;
      break;
    }
  }

  return { isContinue, prices };
};

const NaverPriceComparisonCrawling = async (url, name, st_date, end_date) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // 해당 url로 이동
    await page.goto(url);

    // 최저가 확인
    const selector_minimum_price =
      "#content > div.style_content__v25xx > div > div.summary_info_area__NP6l5 > div.lowestPrice_price_area__VDBfj > div.lowestPrice_low_price__Ypmmk > em";
    await page.waitForSelector(selector_minimum_price);
    const minimum_price = await page.$eval(
      selector_minimum_price,
      (element) => element.textContent
    );
    console.log("minimum price : ", minimum_price);

    // 최저가 출력
    let pageNbr = 1;
    let filledPrices = [];
    while (true) {
      const { isContinue, prices } = await getMinimumPrices(page);
      filledPrices = [...filledPrices, ...prices];

      if (isContinue) {
        const selector_next_page = `#section_price > div.productList_seller_wrap__FZtUS > div.pagination_pagination__JW7zT > a:nth-child(${
          pageNbr + 1
        })`;

        try {
          await page.waitForSelector(selector_next_page, { timeout: 1000 });
          await page.click(selector_next_page);
          pageNbr += 1;
        } catch {
          break;
        }
      } else {
        break;
      }
    }

    browser.close();

    NaverPriceComparisonExcel.NaverPriceComparisonExcel(name, filledPrices);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  NaverPriceComparisonCrawling: NaverPriceComparisonCrawling,
};

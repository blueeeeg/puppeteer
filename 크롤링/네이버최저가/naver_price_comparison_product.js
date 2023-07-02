const puppeteer = require("puppeteer");
const NaverPriceComparisonExcel = require("./excel_naver_price_comparison_product.js");

const wait = async (sec) => {
  let start = Date.now(),
    now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
};

const getInfo = async (page, product_count) => {
  let product_name = "";
  let product_url = "";
  let product_price = "";

  try {
    const selector_product = `#content > div.style_content__xWg5l > div.basicList_list_basis__uNBZx > div > div:nth-child(${product_count}) > div > div.product_inner__gr8QR > div.product_info_area__xxCTi > div.product_title__Mmw2K > a`;
    const selector_price = `#content > div.style_content__xWg5l > div.basicList_list_basis__uNBZx > div > div:nth-child(${product_count}) > div > div > div.product_info_area__xxCTi > div.product_price_area__eTg7I > strong > span > span.price_num__S2p_v`;

    await page.waitForSelector(selector_product, { timeout: 1000 });

    product_name = await page.$eval(
      selector_product,
      (element) => element.textContent
    );
    product_url = await page.$eval(selector_product, (element) => element.href);
    product_price = await page.$eval(
      selector_price,
      (element) => element.textContent
    );
  } catch (err1) {
    console.log("err1 : ", err1);
    try {
      const selector_product = `#content > div.style_content__xWg5l > div.basicList_list_basis__uNBZx > div > div:nth-child(${product_count}) > div > div > div.product_info_area__xxCTi > div.product_title__Mmw2K > a`;
      const selector_price = `#content > div.style_content__xWg5l > div.basicList_list_basis__uNBZx > div > div:nth-child(${product_count}) > div > div > div.product_info_area__xxCTi > div.product_price_area__eTg7I > strong > span > span.price_num__S2p_v`;

      await page.waitForSelector(selector_product, { timeout: 1000 });
      await page.waitForSelector(selector_price, { timeout: 1000 });

      product_name = await page.$eval(
        selector_product,
        (element) => element.textContent
      );
      product_url = await page.$eval(
        selector_product,
        (element) => element.href
      );
      product_price = await page.$eval(
        selector_price,
        (element) => element.textContent
      );
    } catch (err2) {
      console.log("err2 : ", err2);
    }
  }

  return { name: product_name, url: product_url, price: product_price };
};

const NaverPriceComparisonProductCrawling = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 해당 url로 이동
    const url =
      "https://search.shopping.naver.com/search/all?frm=NVSHMDL&origQuery=%EB%8D%94%EB%9E%A9%EB%B0%94%EC%9D%B4%EB%B8%94%EB%9E%91%EB%91%90&pagingIndex=1&pagingSize=40&productSet=model&query=%EB%8D%94%EB%9E%A9%EB%B0%94%EC%9D%B4%EB%B8%94%EB%9E%91%EB%91%90&sort=rel&timestamp=&viewType=list";
    await page.goto(url);
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });

    // 상품 리스트 뽑아오기
    let product_count = 1;
    let product_list = [];

    while (true) {
      const { name, url, price } = await getInfo(page, product_count);

      if (!name || !price) break;

      wait(1);
      await page.evaluate(() => {
        window.scrollBy(0, 220);
      });

      console.log("product info : ", name, url);
      product_count += 1;
      product_list.push({ name, url });
    }

    browser.close();

    // excel에 기입하기
    NaverPriceComparisonExcel.makeNaverPriceComparisonProductList(product_list);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  NaverPriceComparisonProductCrawling: NaverPriceComparisonProductCrawling,
};

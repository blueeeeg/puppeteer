const puppeteer = require("puppeteer");
const OliveyoungExcel = require("./excel_oliveyoung_product.js");

const OliveyoungProductCrawling = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 해당 url로 이동
    const url =
      "https://www.oliveyoung.co.kr/store/display/getBrandShopDetail.do?onlBrndCd=A002924";
    await page.goto(url);

    // 상품 리스트 뽑아오기
    let product_count = 1;
    let product_list = [];
    let product_line = 6;
    while (true) {
      const selector_product = `#allGoodsList > ul:nth-child(${product_line}) > li:nth-child(${product_count}) > div > div.prod-info > a > span`;
      const selector_product_url = `#allGoodsList > ul:nth-child(${product_line}) > li:nth-child(${product_count}) > div > div.prod-info > a`;

      try {
        await page.waitForSelector(selector_product, { timeout: 1000 });
        const product_name = await page.$eval(
          selector_product,
          (element) => element.textContent
        );

        await page.waitForSelector(selector_product_url, { timeout: 1000 });
        const product_url = await page.$eval(selector_product_url, (element) =>
          element.getAttribute("data-ref-goodsno")
        );

        product_list.push({
          name: product_name,
          url: `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${product_url}&dispCatNo=9000002&trackingCd=BrandA002924_PROD`,
        });

        if (product_count === 4) {
          product_count = 1;
          product_line += 1;
        } else product_count += 1;
      } catch (err) {
        console.log("error occurs : ", err);
        break;
      }
    }

    browser.close();
    // excel에 기입하기
    OliveyoungExcel.makeOliveyoungProductList(product_list);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  OliveyoungProductCrawling: OliveyoungProductCrawling,
};

const puppeteer = require("puppeteer");
const NaverExcel = require("./excel_naver_product.js");

const NaverProductCrawling = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 해당 url로 이동
    const url =
      "https://brand.naver.com/blancdoux/category/a09a63dbb0614e26952ffa72b05c88bf?cp=1";
    await page.goto(url);

    // 상품 리스트 뽑아오기
    let product_count = 1;
    let product_list = [];
    while (true) {
      const selector_product = `#CategoryProducts > ul > li:nth-child(${product_count}) > div > a > strong`;
      const selector_product_url = `#CategoryProducts > ul > li:nth-child(${product_count}) > div > a`;

      try {
        await page.waitForSelector(selector_product, { timeout: 1000 });
        const product_name = await page.$eval(
          selector_product,
          (element) => element.textContent
        );

        await page.waitForSelector(selector_product_url, { timeout: 1000 });
        const product_url = await page.$eval(
          selector_product_url,
          (element) => element.href
        );

        product_list.push({
          name: product_name,
          url: product_url,
        });
        product_count += 1;
      } catch (err) {
        console.log("error occurs : ", err);
        break;
      }
    }

    browser.close();

    // excel에 기입하기
    NaverExcel.makeNaverProductList(product_list);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  NaverProductCrawling: NaverProductCrawling,
};

const puppeteer = require("puppeteer");
const PublicExcel = require("./excel_public_product.js");

const PublicProductCrawling = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 해당 url로 이동
    const url = "https://blancdoux.com/product/list.html?cate_no=91";
    await page.goto(url);

    // 상품 리스트 뽑아오기
    let product_count = 1;
    let product_list = [];
    while (true) {
      const selector_product = `#contents > div.product-list__wrapper > div > div.xans-element-.xans-product.xans-product-listnormal.ec-base-product.product-list__column-right > ul > li:nth-child(${product_count}) > a > div > div.description__wrap > div > div > div.description-top > div > span`;
      const selector_product_url = `#contents > div.product-list__wrapper > div > div.xans-element-.xans-product.xans-product-listnormal.ec-base-product.product-list__column-right > ul > li:nth-child(${product_count}) > a`;

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
    PublicExcel.makePublicProductList(product_list);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  PublicProductCrawling: PublicProductCrawling,
};

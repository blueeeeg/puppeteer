const puppeteer = require("puppeteer");
const CoopangExcel = require("./excel_coopang_product.js");

const CoopangProductCrawling = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    // 해당 url로 이동
    const url =
      "https://www.coupang.com/np/products/brand-shop?brandName=%EB%8D%94%EB%9E%A9%EB%B0%94%EC%9D%B4%EB%B8%94%EB%9E%91%EB%91%90&listSize=36&filterType=rocket&customPriceRange=false&minPrice=&maxPrice=&page=1&trcid=&traid=&channel=user&sorter=bestAsc&filter=";
    await page.goto(url);

    // 상품 리스트 뽑아오기
    let product_list = [];

    const selector_product_list = "#productList";
    await page.waitForSelector(selector_product_list, { timeout: 1000 });
    const product_nbr_list_str = await page.$eval(
      selector_product_list,
      (element) => element.getAttribute("data-products")
    );
    const product_nbr_list = JSON.parse(product_nbr_list_str).indexes;

    for (let i = 0; i < product_nbr_list.length; i += 1) {
      let url = "";
      let name = "";

      const xpath_url = await page.$x(
        `/html/body/div[3]/section/form/div/div[2]/div[1]/div/ul/li[${i + 1}]/a`
      );

      if (xpath_url.length > 0) {
        const href = await xpath_url[0].getProperty("href");
        url = await href.jsonValue();
      }

      const xpath_name = await page.$x(
        `/html/body/div[3]/section/form/div/div[2]/div[1]/div/ul/li[${
          i + 1
        }]/a/dl/dd/div[2]`
      );

      if (xpath_name.length > 0) {
        const textContent = await xpath_name[0].getProperty("textContent");
        const originName = await textContent.jsonValue();
        name = originName.slice(5, originName.length - 1);
      }

      const xpath_stock = await page.$x(
        `/html/body/div[3]/section/form/div/div[2]/div[1]/div/ul/li[${i}]/a/dl/dd/div[3]/div[2]`
      );

      if (xpath_stock.length <= 0) {
        product_list.push({ name, url });
      } else {
        const textContent = await xpath_stock[0].getProperty("textContent");
        const outOfStock = await textContent.jsonValue();

        if (!outOfStock.includes("일시품절")) product_list.push({ name, url });
      }
    }

    browser.close();

    // excel에 기입하기
    CoopangExcel.makeCoopangProductList(product_list);
  } catch (e) {
    console.log(e);
  }
};

CoopangProductCrawling();

module.exports = {
  CoopangProductCrawling: CoopangProductCrawling,
};

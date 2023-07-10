const express = require("express");
const app = express();
const port = 3000;

// 각 페이지로 이동
app.get("", (req, res) => {
  res.sendFile(__dirname + "/crawling.html");
});

app.get("/all", (req, res) => {
  res.sendFile(__dirname + "/통합/all.html");
});

app.get("/public", (req, res) => {
  res.sendFile(__dirname + "/공식몰/public.html");
});

app.get("/naver", (req, res) => {
  res.sendFile(__dirname + "/네이버/naver.html");
});

app.get("/oliveyoung", (req, res) => {
  res.sendFile(__dirname + "/올리브영/oliveyoung.html");
});

app.get("/coopang", (req, res) => {
  res.sendFile(__dirname + "/쿠팡/coopang.html");
});

app.get("/naverPriceComparison", (req, res) => {
  res.sendFile(__dirname + "/네이버최저가/naverPriceComparison.html");
});

// crawling.html과 crawling.css 연결
app.use(express.static(__dirname));

// req body를 보려면 이걸 넣어야되네
app.use(express.urlencoded({ extended: false }));

// 전체 상품 크롤링
app.post("/listAll", async (req, res) => {
  const publicCrawler = require("./공식몰/public_product.js");
  await publicCrawler.PublicProductCrawling();

  const naverCrawler = require("./네이버/naver_product.js");
  await naverCrawler.NaverProductCrawling();

  const oliveyoungCrawler = require("./올리브영/oliveyoung_product.js");
  await oliveyoungCrawler.OliveyoungProductCrawling();

  const coopangCrawler = require("./쿠팡/coopang_product.js");
  await coopangCrawler.CoopangProductCrawling();

  res.send({ message: "finish to update" });
});

app.post("/crawlingAll", async (req, res) => {
  const params = req.body;

  // 공식몰 상품 갱신 -> 불러오기 -> 크롤링
  const publicListCrawler = require("./공식몰/excel_public_product.js");
  const publicList = await publicListCrawler.getPublicProductList();

  const publicCrawler = require("./공식몰/public.js");
  for (let i = 0; i < publicList.length; i += 1) {
    await publicCrawler.PublicCrawler(
      publicList[i].url,
      publicList[i].name,
      params.st_date,
      params.end_date
    );
  }

  // 네이버 상품 갱신 -> 불러오기 -> 크롤링
  const naverListCrawler = require("./네이버/excel_naver_product.js");
  const naverList = await naverListCrawler.getNaverProductList();

  const naverCrawler = require("./네이버/naver.js");
  for (let i = 0; i < naverList.length; i += 1) {
    await naverCrawler.NaverCrawling(
      naverList[i].url,
      naverList[i].name,
      params.st_date,
      params.end_date
    );
  }

  // 올리브영 상품 갱신 -> 불러오기 -> 크롤링
  const oliveyoungListCrawler = require("./올리브영/excel_oliveyoung_product.js");
  const oliveyoungList = await oliveyoungListCrawler.getOliveyoungProductList();

  const oliveyoungCrawler = require("./올리브영/oliveyoung.js");
  for (let i = 0; i < oliveyoungList.length; i += 1) {
    await oliveyoungCrawler.OliveyoungCrawling(
      oliveyoungList[i].url,
      oliveyoungList[i].name,
      params.st_date,
      params.end_date
    );
  }

  // 쿠팡 상품 갱신 -> 불러오기 -> 크롤링
  const coopangListCrawler = require("./쿠팡/excel_coopang_product.js");
  const coopangList = await coopangListCrawler.getCoopangProductList();

  const coopangCrawler = require("./쿠팡/coopang.js");
  for (let i = 0; i < coopangList.length; i += 1) {
    await coopangCrawler.CoopangCrawler(
      coopangList[i].url,
      coopangList[i].name,
      params.st_date,
      params.end_date
    );
  }

  res.send({ message: "finish to crawling all" });
});

// 공식몰 api
app.post("/publicCrawling", async (req, res) => {
  const publicCrawler = require("./공식몰/public.js");

  const params = req.body;
  console.log("params check : ", params);
  await publicCrawler.PublicCrawler(
    params.url,
    params.name,
    params.st_date,
    params.end_date
  );

  res.send({ message: "finish to crawling" });
});

// 공식몰 상품 리스트 받아오기
app.get("/publicList", async (req, res) => {
  console.log("공식몰 상품 리스트 받아오기");
  const publicCrawler = require("./공식몰/excel_public_product.js");

  const data = await publicCrawler.getPublicProductList();
  res.send(data);
});

// 공식몰 상품 갱신하기
app.post("/publicList", async (req, res) => {
  console.log("공식몰 상품 리스트 갱신하기");
  const publicCrawler = require("./공식몰/public_product.js");

  await publicCrawler.PublicProductCrawling();

  res.send({ message: "finish to update" });
});

// 네이버 api
app.post("/naverCrawling", async (req, res) => {
  const naverCrawler = require("./네이버/naver.js");

  const params = req.body;

  await naverCrawler.NaverCrawling(
    params.url,
    params.name,
    params.st_date,
    params.end_date
  );

  res.send({ message: "finish to crawling" });
});

// 네이버 상품 리스트 받아오기
app.get("/naverList", async (req, res) => {
  console.log("네이버 상품 리스트 받아오기");
  const naverCrawler = require("./네이버/excel_naver_product.js");

  const data = await naverCrawler.getNaverProductList();
  res.send(data);
});

// 네이버 상품 갱신하기
app.post("/naverList", async (req, res) => {
  console.log("네이버 상품 리스트 갱신하기");
  const naverCrawler = require("./네이버/naver_product.js");

  await naverCrawler.NaverProductCrawling();

  res.send({ message: "finish to update" });
});

// 올리브영 api
app.post("/oliveyoungCrawling", async (req, res) => {
  const oliveyoungCrawler = require("./올리브영/oliveyoung.js");

  const params = req.body;
  console.log("params check : ", params);
  await oliveyoungCrawler.OliveyoungCrawling(
    params.url,
    params.name,
    params.st_date,
    params.end_date
  );

  res.send({ message: "finish to crawling" });
});

// 올리브영 상품 리스트 받아오기
app.get("/oliveyoungList", async (req, res) => {
  console.log("올리브영 상품 리스트 받아오기");
  const oliveyoungCrawler = require("./올리브영/excel_oliveyoung_product.js");

  const data = await oliveyoungCrawler.getOliveyoungProductList();
  res.send(data);
});

// 올리브영 상품 갱신하기
app.post("/oliveyoungList", async (req, res) => {
  console.log("올리브영 상품 리스트 갱신하기");
  const oliveyoungCrawler = require("./올리브영/oliveyoung_product.js");

  await oliveyoungCrawler.OliveyoungProductCrawling();

  res.send({ message: "finish to update" });
});

// 쿠팡 api
app.post("/coopangCrawling", async (req, res) => {
  const coopangCrawler = require("./쿠팡/coopang.js");

  const params = req.body;
  console.log("params check : ", params);
  await coopangCrawler.CoopangCrawler(
    params.url,
    params.name,
    params.st_date,
    params.end_date
  );

  res.send({ message: "finish to crawling" });
});

// 쿠팡 상품 리스트 받아오기
app.get("/coopangList", async (req, res) => {
  console.log("쿠팡 상품 리스트 받아오기");
  const coopangCrawler = require("./쿠팡/excel_coopang_product.js");

  const data = await coopangCrawler.getCoopangProductList();
  res.send(data);
});

// 쿠팡 상품 갱신하기
app.post("/coopangList", async (req, res) => {
  console.log("쿠팡 상품 리스트 갱신하기");
  const coopangCrawler = require("./쿠팡/coopang_product.js");

  await coopangCrawler.CoopangProductCrawling();

  res.send({ message: "finish to update" });
});

// 네이버최저가 api
app.post("/naverPriceComparisonCrawling", async (req, res) => {
  const naverPriceComparisonCrawler = require("./네이버최저가/naver_price_comparison.js");

  const params = req.body;
  console.log("params check : ", params);
  await naverPriceComparisonCrawler.NaverPriceComparisonCrawling(
    params.url,
    params.name,
    params.st_date,
    params.end_date
  );

  res.send({ message: "finish to crawling" });
});

// 전체 상품 크롤링
app.post("/naverPriceComparisonCrawlingAll", async (req, res) => {
  const naverPriceComparisonProductCrawler = require("./네이버최저가/excel_naver_price_comparison_product.js");
  const naverPriceComparisonCrawler = require("./네이버최저가/naver_price_comparison.js");

  const productList =
    await naverPriceComparisonProductCrawler.getNaverPriceComparisonProductList();
  for (let i = 0; i < productList.length; i += 1) {
    await naverPriceComparisonCrawler.NaverPriceComparisonCrawling(
      productList[i].url,
      productList[i].name
    );
  }

  res.send({ message: "finish to crawling all" });
});

// 네이버최저가 상품 리스트 받아오기
app.get("/naverPriceComparisonList", async (req, res) => {
  console.log("네이버최저가 상품 리스트 받아오기");
  const naverPriceComparisonCrawler = require("./네이버최저가/excel_naver_price_comparison_product.js");

  const data =
    await naverPriceComparisonCrawler.getNaverPriceComparisonProductList();
  res.send(data);
});

// 네이버최저가 상품 갱신하기
app.post("/naverPriceComparisonList", async (req, res) => {
  console.log("네이버최저가 상품 리스트 갱신하기");
  const naverPriceComparisonCrawler = require("./네이버최저가/naver_price_comparison_product.js");

  await naverPriceComparisonCrawler.NaverPriceComparisonProductCrawling();

  res.send({ message: "finish to update" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

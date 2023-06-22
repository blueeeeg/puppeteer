const puppeteer = require("puppeteer");
const CoopangExcel = require("./excel_coopang.js");

const wait = async (sec) => {
  let start = Date.now(),
    now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
};

const getTextFromSelector = async (page, selector, isScore) => {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    if (isScore)
      return await page.$eval(selector, (element) =>
        element.getAttribute("data-rating")
      );
    return await page.$eval(selector, (element) => element.textContent);
  } catch (err) {
    return "";
  }
};

const convertDateFormat = (date) => {
  const [year, month, day] = date.split(".");
  return `${year.slice(2)}${month}${day}`;
};

const betweenDateChecker = (date, st_date, end_date) => {
  const convertedDate = convertDateFormat(date);

  if (st_date <= convertedDate && convertedDate <= end_date) return true;
  else return false;
};

const earlyDateCheckerThanEndDate = (date, end_date) => {
  const convertedDate = convertDateFormat(date);

  if (convertedDate < end_date) return true;
  else return false;
};

const getReviews = async (page, st_date, end_date) => {
  let isContinue = true;
  let reviews = [];

  for (let i = 3; i < 8; i += 1) {
    const selector_score = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__info > div.sdp-review__article__list__info__product-info > div.sdp-review__article__list__info__product-info__star-gray > div`;
    const selector_date = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__info > div.sdp-review__article__list__info__product-info > div.sdp-review__article__list__info__product-info__reg-date`;
    const selector_reviewer = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__info > div.sdp-review__article__list__info__user > span`;
    const selector_seller = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__info > div.sdp-review__article__list__info__product-info__seller_name`;
    const selector_smell_satisfaction = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__survey > div:nth-child(1) > span.sdp-review__article__list__survey__row__answer`;
    const selector_skin_stimulation = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__survey > div:nth-child(2) > span.sdp-review__article__list__survey__row__answer`;
    const selector_skin_coverage = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__survey > div:nth-child(3) > span.sdp-review__article__list__survey__row__answer`;
    const selector_review = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > article:nth-child(${i}) > div.sdp-review__article__list__review.js_reviewArticleContentContainer > div`;

    try {
      const score = await getTextFromSelector(page, selector_score, true);
      const date = await getTextFromSelector(page, selector_date);
      const reviewer = await getTextFromSelector(page, selector_reviewer);
      const seller = await getTextFromSelector(page, selector_seller);
      const smellSatisfaction = await getTextFromSelector(
        page,
        selector_smell_satisfaction
      );
      const skinStimulus = await getTextFromSelector(
        page,
        selector_skin_stimulation
      );
      const skinCoverage = await getTextFromSelector(
        page,
        selector_skin_coverage
      );
      const review = await getTextFromSelector(page, selector_review);

      if (!score) {
        isContinue = false;
        break;
      }
      if (end_date && earlyDateCheckerThanEndDate(date, end_date)) {
        isContinue = false;
        break;
      }
      if (st_date && end_date && !betweenDateChecker(date, st_date, end_date))
        continue;

      if (seller.includes("쿠팡(주)"))
        reviews.push({
          id: reviewer,
          date: date,
          score: score,
          smellSatisfaction: smellSatisfaction,
          skinStimulus: skinStimulus,
          skinCoverage: skinCoverage,
          review: review,
        });
      console.log(
        `${i - 2}번째 리뷰 : `,
        score,
        date,
        reviewer,
        smellSatisfaction,
        skinStimulus,
        skinCoverage,
        review
      );
    } catch {
      isContinue = false;
      break;
    }
  }

  return { isContinue, reviews };
};

const CoopangCrawler = async (url, name, st_date, end_date) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // 해당 url로 이동
    await page.goto(url);

    // 상품평 버튼 클릭
    wait(1);
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });

    const selector_review_button = "#btfTab > ul.tab-titles > li:nth-child(2)";
    await page.waitForSelector(selector_review_button);
    await page.click(selector_review_button);

    // 최신순 버튼 클릭
    const selector_order_recent =
      "#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.sdp-review__article__order.js_reviewArticleOrderContainer.sdp-review__article__order--active > div.sdp-review__article__order__sort > button.sdp-review__article__order__sort__newest-btn.js_reviewArticleNewListBtn.js_reviewArticleSortBtn";
    await page.waitForSelector(selector_order_recent);
    await page.click(selector_order_recent);

    // 리뷰 개수 확인
    const selector_review_count =
      "#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__average.js_reviewAverageContainer > section.sdp-review__average__total-star > div.sdp-review__average__total-star__info > div.sdp-review__average__total-star__info-count";
    await page.waitForSelector(selector_review_count);
    const review_count = await page.$eval(
      selector_review_count,
      (element) => element.textContent
    );
    console.log("review count : ", review_count);

    wait(1);
    let pageNbr = 3;
    let filledReviews = [];
    while (true) {
      const { isContinue, reviews } = await getReviews(page, st_date, end_date);
      filledReviews = [...filledReviews, ...reviews];

      if (isContinue) {
        let selector_next_page;

        if (pageNbr === 12) {
          selector_next_page = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > div.sdp-review__article__page.js_reviewArticlePagingContainer > button.sdp-review__article__page__next.sdp-review__article__page__next--active.js_reviewArticlePageNextBtn`;
          pageNbr = 3;
        } else {
          selector_next_page = `#btfTab > ul.tab-contents > li.product-review.tab-contents__content > div > div.sdp-review__article.js_reviewArticleContainer > section.js_reviewArticleListContainer > div.sdp-review__article__page.js_reviewArticlePagingContainer > button:nth-child(${pageNbr})`;
          pageNbr += 1;
        }

        try {
          await page.waitForSelector(selector_next_page, { timeout: 1000 });
          await page.click(selector_next_page);

          wait(0.5);
        } catch (err) {
          console.log(1);
          break;
        }
      } else {
        console.log(2);
        break;
      }
    }

    browser.close();

    CoopangExcel.CoopangExcel(name, filledReviews);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  CoopangCrawler: CoopangCrawler,
};

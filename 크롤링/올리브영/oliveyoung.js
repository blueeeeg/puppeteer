const puppeteer = require("puppeteer");
const OliveyoungExcel = require("./excel_oliveyoung");

const wait = async (sec) => {
  let start = Date.now(),
    now = start;
  while (now - start < sec * 1000) {
    now = Date.now();
  }
};

const getTextFromSelector = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
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

  for (let i = 0; i < 10; i += 1) {
    const selector_score = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.score_area > span.review_point > span`;
    const selector_date = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.score_area > span.date`;
    const selector_reviewer = `#gdasList > li:nth-child(${
      i + 1
    }) > div.info > div > p > a`;
    const selector_usage_period = `#gdasList > li:nth-child(${
      i + 1
    }) > div.info > div > div > div > a`;
    const selector_skin_type = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.poll_sample > dl:nth-child(1) > dd > span`;
    const selector_skin_worry = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.poll_sample > dl:nth-child(2) > dd > span`;
    const selector_skin_stimulation = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.poll_sample > dl:nth-child(3) > dd > span`;
    const selector_review = `#gdasList > li:nth-child(${
      i + 1
    }) > div.review_cont > div.txt_inner`;

    try {
      const score = await getTextFromSelector(page, selector_score);
      const date = await getTextFromSelector(page, selector_date);
      const reviewer = await getTextFromSelector(page, selector_reviewer);
      const usage_period = await getTextFromSelector(
        page,
        selector_usage_period
      );
      const skin_type = await getTextFromSelector(page, selector_skin_type);
      const skin_worry = await getTextFromSelector(page, selector_skin_worry);
      const skin_stimulation = await getTextFromSelector(
        page,
        selector_skin_stimulation
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

      reviews.push({
        id: reviewer,
        date: date,
        score: score,
        usagePeriod: usage_period,
        skinType: skin_type,
        skinWorry: skin_worry,
        skinStimulus: skin_stimulation,
        review: review,
      });
      // console.log(
      //   `${i + 1}번째 정보 : `,
      //   score,
      //   date,
      //   reviewer,
      //   usage_period,
      //   skin_type,
      //   skin_worry,
      //   skin_stimulation,
      //   review
      // );
    } catch {
      isContinue = false;
      break;
    }
  }

  return { isContinue, reviews };
};

const OliveyoungCrawling = async (url, name, st_date, end_date) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // 해당 url로 이동
    await page.goto(url);

    // 리뷰 버튼 클릭
    const selector_review_button = "#reviewInfo";
    await page.waitForSelector(selector_review_button);
    await page.click(selector_review_button);

    // 최신순 버튼 클릭
    const selector_order_recent = "#gdasSort > li:nth-child(3)";
    await page.waitForSelector(selector_order_recent);
    await page.click(selector_order_recent);

    let pageNbr = 1;
    let currentPageNbr = 1;
    let filledReviews = [];
    while (true) {
      const { isContinue, reviews } = await getReviews(page, st_date, end_date);
      filledReviews = [...filledReviews, ...reviews];

      if (isContinue) {
        let selector_next_page;

        if (pageNbr < 10) {
          if (currentPageNbr > 10)
            selector_next_page = `#gdasContentsArea > div > div.pageing > a:nth-child(${
              pageNbr + 2
            })`;
          else
            selector_next_page = `#gdasContentsArea > div > div.pageing > a:nth-child(${
              pageNbr + 1
            })`;
          pageNbr += 1;
        } else {
          selector_next_page = `#gdasContentsArea > div > div.pageing > a.next`;
          pageNbr = 1;
        }

        try {
          await page.waitForSelector(selector_next_page, { timeout: 1000 });
          await page.click(selector_next_page);
          currentPageNbr += 1;

          wait(0.5);
        } catch (err) {
          break;
        }
      } else {
        break;
      }
    }

    browser.close();

    OliveyoungExcel.OliveyoungExcel(name, filledReviews);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  OliveyoungCrawling: OliveyoungCrawling,
};

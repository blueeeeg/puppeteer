const puppeteer = require("puppeteer");
const NaverExcel = require("./excel_naver.js");

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
  return `${year}${month}${day}`;
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

const usageDivider = (str) => {
  const usage = ["피부 타입", "트러블케어", "피부자극", "촉촉함"];

  str = str.replace("피부 타입", "피부 타입 : ");
  str = str.replace("트러블케어", " / 트러블케어 : ");
  str = str.replace("피부자극", " / 피부자극 : ");
  str = str.replace("촉촉함", " / 촉촉함 : ");

  if (str.includes("/")) str = str.split(" / ");
  else str = ["", "", "", ""];

  let usageReviews = ["", "", "", ""];
  for (let i = 0; i < str.length; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      if (str[i].includes(usage[j])) {
        usageReviews[j] = str[i].replace(`${usage[j]} : `, "");
        break;
      }
    }
  }

  return usageReviews;
};

let reviews = [];
const getReviews = async (page, st_date, end_date) => {
  let isContinue = true;
  for (let i = 0; i < 20; i += 1) {
    const selector_score = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > ul > li:nth-child(${
      i + 1
    }) > div > div > div > div._1XNnRviOK8 > div > div._1YShY6EQ56 > div._1rZLm75kLm > div._37TlmH3OaI > div._2V6vMO_iLm > em`;
    const selector_reviewer = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > ul > li:nth-child(${
      i + 1
    }) > div > div > div > div._1XNnRviOK8 > div > div._1YShY6EQ56 > div._1rZLm75kLm > div._37TlmH3OaI > div._2FmJXrTVEX > strong`;
    const selector_date = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > ul > li:nth-child(${
      i + 1
    }) > div > div > div > div._1XNnRviOK8 > div > div > div._1rZLm75kLm > div._37TlmH3OaI > div._2FmJXrTVEX > span`;
    const selector_usage_review = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > ul > li:nth-child(${
      i + 1
    }) > div > div > div > div._1XNnRviOK8 > div > div._1YShY6EQ56 > div._1rZLm75kLm > div._37TlmH3OaI > div._14FigHP3K8 > dl`;
    const selector_review = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > ul > li:nth-child(${
      i + 1
    }) > div > div > div > div._1XNnRviOK8 > div > div._1YShY6EQ56 > div._19SE1Dnqkf > div`;

    try {
      const score = await getTextFromSelector(page, selector_score);
      const reviewer = await getTextFromSelector(page, selector_reviewer);
      const date = await getTextFromSelector(page, selector_date);
      const usage_review = await getTextFromSelector(
        page,
        selector_usage_review
      );
      const review = await getTextFromSelector(page, selector_review);
      const revised_usage_review = usageDivider(usage_review);

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
        skinType: revised_usage_review[0],
        troubleCare: revised_usage_review[1],
        skinStimulus: revised_usage_review[2],
        moisture: revised_usage_review[3],
        review: review,
      });

      // console.log(
      //   `${i + 1}번째 정보 : `,
      //   score,
      //   reviewer,
      //   date,
      //   usage_review,
      //   review
      // );
    } catch {
      isContinue = false;
      break;
    }
  }

  return { isContinue };
};

const NaverCrawling = async (url, name, st_date, end_date) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // 해당 url로 이동
    await page.goto(url);
    // 리뷰 버튼 보이는 위치로 이동
    await page.evaluate(() => {
      window.scrollTo(0, 2000);
    });

    const selector_review_button =
      "#content > div > div.z7cS6-TO7X > div._27jmWaPaKy > ul > li:nth-child(2) > a";
    await page.waitForSelector(selector_review_button);
    await page.click(selector_review_button);

    const selector_review_count =
      "#REVIEW > div > div._180GG7_7yx > div._2PqWvCMC3e > div._3Tobq9fjVh > strong > span";
    await page.waitForSelector(selector_review_count);
    const review_count = await page.$eval(
      selector_review_count,
      (element) => element.textContent
    );
    console.log("review count : ", review_count);

    const selector_order_recent =
      "#REVIEW > div > div._180GG7_7yx > div._2PqWvCMC3e > div._3Tobq9fjVh > ul > li:nth-child(2) > a";
    await page.click(selector_order_recent);
    wait(1);

    let pageNbr = 2;
    while (true) {
      const { isContinue } = await getReviews(page, st_date, end_date);
      if (isContinue) {
        let selector_next_page;
        if (pageNbr === 11) {
          selector_next_page = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > div > div > a.fAUKm1ewwo._2Ar8-aEUTq`;
          pageNbr = 2;
        } else {
          selector_next_page = `#REVIEW > div > div._180GG7_7yx > div.cv6id6JEkg > div > div > a:nth-child(${
            pageNbr + 1
          })`;
          pageNbr += 1;
        }
        // TODO 마지막이라서 더 갈 곳이 없는 경우 처리
        try {
          await page.waitForSelector(selector_next_page, { timeout: 1000 });
          await page.click(selector_next_page);
          wait(0.5);
        } catch (err) {
          console.log("error occurs : ", err);
          break;
        }
      } else {
        break;
      }
    }
    browser.close();

    NaverExcel.NaverExcel(name, reviews);
  } catch (e) {
    console.log(e);
  }
};

// NaverCrawling();
module.exports = {
  NaverCrawling: NaverCrawling,
};

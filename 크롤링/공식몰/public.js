const puppeteer = require("puppeteer");
const PublicExcel = require("./excel_public");

const getTextFromSelector = async (frame, selector) => {
  try {
    await frame.waitForSelector(selector, { timeout: 1000 });
    return await frame.$eval(selector, (element) => element.textContent);
  } catch (err) {
    return "";
  }
};

const convertDateFormat = (date) => {
  const [year, month, day] = date.split(".");

  if (month.length === 1) return `${year.slice(2)}0${month}${day}`;
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

let reviews = [];
const getReviews = async (frame, id_list, st_date, end_date) => {
  let isContinue = true;

  for (let i = 0; i < id_list.length; i += 1) {
    const selector_score = `#${id_list[i]} > div.review_list_v2__review_lcontent > div > div.review_list_v2__score_section > div.review_list_v2__score_container > div.review_list_v2__score_text`;
    const selector_date = `#${id_list[i]} > div.review_list_v2__review_lcontent > div > div.review_list_v2__score_section > div.review_list_v2__edit_container > div`;
    const selector_reviewer = `#${id_list[i]} > div.review_list_v2__review_rcontent > div.review_list_v2__user_name_message`;
    const selector_skin_type = `#${id_list[i]} > div.review_list_v2__review_rcontent > div.review_list_v2__options_section > div > div:nth-child(1)`;
    const selector_age = `#${id_list[i]} > div.review_list_v2__review_rcontent > div.review_list_v2__options_section > div > div:nth-child(2)`;
    const selector_skin_worry = `#${id_list[i]} > div.review_list_v2__review_rcontent > div.review_list_v2__options_section > div > div:nth-child(3)`;
    const selector_review = `#${id_list[i]} > div.review_list_v2__review_lcontent > div > div.review_list_v2__content_section > div > div.review_list_v2__content.review_content__collapsed > div > div > div.review_list_v2__message.js-collapsed-review-content.js-translate-text`;

    try {
      const score = await getTextFromSelector(frame, selector_score);
      const date = await getTextFromSelector(frame, selector_date);
      const reviewer = await getTextFromSelector(frame, selector_reviewer);
      const age = await getTextFromSelector(frame, selector_age);
      const skin_type = await getTextFromSelector(frame, selector_skin_type);
      const skin_worry = await getTextFromSelector(frame, selector_skin_worry);
      const review = await getTextFromSelector(frame, selector_review);

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
        date,
        score,
        age,
        skinType: skin_type,
        skinWorry: skin_worry,
        review,
      });

      // console.log(
      //   `${i + 1}번째 정보 : `,
      //   score,
      //   date,
      //   reviewer,
      //   age,
      //   skin_type,
      //   skin_worry,
      //   review
      // );
    } catch {
      isContinue = false;
      break;
    }
  }

  return { isContinue };
};

const PublicCrawler = async (url, name, st_date, end_date) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-features=site-per-process"],
    });
    const page = await browser.newPage();

    // 리뷰 크롤링
    let pageNbr = 1;
    while (true) {
      const revisedUrl = `${url}?crema-product-reviews-1-page=${pageNbr}`;

      // 해당 url로 이동
      await page.goto(revisedUrl);

      // iframe 안으로 들어감
      const iframe_selector = "#crema-product-reviews-1";
      const frame_handle = await page.$(iframe_selector);
      const frame = await frame_handle.contentFrame();

      const selector_review_container =
        ".review_list_v2.review_list_v2--collapsed.renewed_review.js-review-container";

      const id_list = [];
      const container_list = await frame.$$(selector_review_container);

      for (const container of container_list) {
        const id = await frame.evaluate((el) => el.id, container);

        id_list.push(id);
      }
      if (id_list.length === 0) break;

      const { isContinue } = await getReviews(
        frame,
        id_list,
        st_date,
        end_date
      );

      if (isContinue) pageNbr += 1;
      else break;
    }

    browser.close();

    PublicExcel.PublicExcel(name, reviews);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  PublicCrawler: PublicCrawler,
};

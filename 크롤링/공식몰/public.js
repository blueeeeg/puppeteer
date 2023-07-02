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

const earlyDateCheckerThanStDate = (date, st_date) => {
  const convertedDate = convertDateFormat(date);

  if (convertedDate < st_date) return true;
  else return false;
};

const lateDateCheckerThanEndDate = (date, end_date) => {
  const convertedDate = convertDateFormat(date);

  if (end_date < convertedDate) return true;
  else return false;
};

const scoreTextToNbr = (str) => {
  if (str === "아주 좋아요") return "5";
  else if (str === "맘에 들어요") return "4";
  else if (str === "보통이에요") return "3";
  else if (str === "그냥 그래요") return "2";
  return "1";
};

const getReviews = async (frame, id_list, st_date, end_date) => {
  let isContinue = true;
  let reviews = [];

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
      let age = await getTextFromSelector(frame, selector_age);
      let skin_type = await getTextFromSelector(frame, selector_skin_type);
      let skin_worry = await getTextFromSelector(frame, selector_skin_worry);
      const review = await getTextFromSelector(frame, selector_review);

      if (!score) {
        isContinue = false;
        break;
      }
      if (st_date && earlyDateCheckerThanStDate(date, st_date)) {
        isContinue = false;
        break;
      }
      if (end_date && lateDateCheckerThanEndDate(date, end_date)) {
        continue;
      }

      if (age) age = age.replace("연령대", "").trim();
      if (skin_type) skin_type = skin_type.replace("피부타입", "").trim();
      if (skin_worry) skin_worry = skin_worry.replace("피부고민", "").trim();

      reviews.push({
        id: reviewer,
        date,
        score: scoreTextToNbr(score),
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

  return { isContinue, reviews };
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
    let filledReviews = [];
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

      const { isContinue, reviews } = await getReviews(
        frame,
        id_list,
        st_date,
        end_date
      );
      filledReviews = [...filledReviews, ...reviews];

      if (isContinue) pageNbr += 1;
      else break;
    }

    browser.close();

    PublicExcel.PublicExcel(name, filledReviews);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  PublicCrawler: PublicCrawler,
};

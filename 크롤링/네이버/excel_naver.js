const valueChecker = (value) => {
  if (value) return value;
  return "";
};

// 엑셀 파일 생성
const makeFile = async (workbook, name) => {
  await workbook.xlsx.writeFile(`./네이버/리뷰/${name}.xlsx`);
};

const fillData = (worksheet, reviewData) => {
  for (let i = 0; i < reviewData.length; i += 1) {
    worksheet.addRow([
      valueChecker(reviewData[i].id),
      valueChecker(reviewData[i].date),
      valueChecker(reviewData[i].score),
      valueChecker(reviewData[i].skinType),
      valueChecker(reviewData[i].troubleCare),
      valueChecker(reviewData[i].skinStimulus),
      valueChecker(reviewData[i].moisture),
      valueChecker(reviewData[i].review),
    ]);
  }
};

const NaverExcel = (name, reviewData) => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();

  workbook.xlsx
    .readFile(`./네이버/리뷰/${name}.xlsx`)
    .then((res) => {
      const worksheet = res.getWorksheet("리뷰");

      fillData(worksheet, reviewData);
      // for (let i = 0; i < reviewData.length; i += 1) {
      //   worksheet.addRow([
      //     valueChecker(reviewData[i].id),
      //     valueChecker(reviewData[i].date),
      //     valueChecker(reviewData[i].score),
      //     valueChecker(reviewData[i].skinType),
      //     valueChecker(reviewData[i].troubleCare),
      //     valueChecker(reviewData[i].skinStimulus),
      //     valueChecker(reviewData[i].moisture),
      //     valueChecker(reviewData[i].review),
      //   ]);
      // }

      makeFile(workbook, name);
    })
    .catch(() => {
      const worksheet = workbook.addWorksheet("리뷰");

      worksheet.addRow([
        "이름(아이디)",
        "일자",
        "별점",
        "피부타입",
        "트러블케어",
        "피부자극",
        "촉촉함",
        "리뷰",
      ]);

      fillData(worksheet, reviewData);
      // for (let i = 0; i < reviewData.length; i += 1) {
      //   worksheet.addRow([
      //     valueChecker(reviewData[i].id),
      //     valueChecker(reviewData[i].date),
      //     valueChecker(reviewData[i].score),
      //     valueChecker(reviewData[i].skinType),
      //     valueChecker(reviewData[i].troubleCare),
      //     valueChecker(reviewData[i].skinStimulus),
      //     valueChecker(reviewData[i].moisture),
      //     valueChecker(reviewData[i].review),
      //   ]);
      // }

      makeFile(workbook, name);
    });
};

module.exports = {
  NaverExcel: NaverExcel,
};

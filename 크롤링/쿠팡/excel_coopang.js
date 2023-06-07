const valueChecker = (value) => {
  if (value) return value;
  return "";
};

// 엑셀 파일 생성
const makeFile = async (workbook, name) => {
  await workbook.xlsx.writeFile(`./쿠팡/리뷰/${name}.xlsx`);
};

const fillData = (worksheet, reviewData) => {
  for (let i = 0; i < reviewData.length; i += 1) {
    worksheet.addRow([
      valueChecker(reviewData[i].id),
      valueChecker(reviewData[i].date),
      valueChecker(reviewData[i].score),
      valueChecker(reviewData[i].smellSatisfaction),
      valueChecker(reviewData[i].moisture),
      valueChecker(reviewData[i].skinStimulus),
      valueChecker(reviewData[i].review),
    ]);
  }
};

const CoopangExcel = (name, reviewData) => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();

  workbook.xlsx
    .readFile(`./쿠팡/리뷰/${name}.xlsx`)
    .then((res) => {
      const worksheet = res.getWorksheet("리뷰");

      fillData(worksheet, reviewData);

      makeFile(workbook, name);
    })
    .catch(() => {
      const worksheet = workbook.addWorksheet("리뷰");

      worksheet.addRow([
        "이름(아이디)",
        "일자",
        "별점",
        "향만족도",
        "보습력",
        "자극도",
        "리뷰",
      ]);

      fillData(worksheet, reviewData);

      makeFile(workbook, name);
    });
};

module.exports = {
  CoopangExcel: CoopangExcel,
};

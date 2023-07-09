const valueChecker = (value) => {
  if (value) return value.trim();
  return "";
};

// 엑셀 파일 생성
const makeFile = async (workbook) => {
  await workbook.xlsx.writeFile(`./리뷰.xlsx`);
};

const fillData = (worksheet, reviewData, name) => {
  for (let i = 0; i < reviewData.length; i += 1) {
    worksheet.addRow([
      "올리브영",
      name,
      valueChecker(reviewData[i].date),
      valueChecker(reviewData[i].score),
      valueChecker(reviewData[i].review),
      valueChecker(reviewData[i].id),
      "",
      valueChecker(reviewData[i].usagePeriod),
      valueChecker(reviewData[i].skinType),
      valueChecker(reviewData[i].skinWorry),
      valueChecker(reviewData[i].skinStimulus),
    ]);
  }
};

const OliveyoungExcel = (name, reviewData) => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();

  workbook.xlsx
    .readFile(`./리뷰.xlsx`)
    .then((res) => {
      const worksheet = res.getWorksheet("리뷰");

      fillData(worksheet, reviewData, name);

      makeFile(workbook);
    })
    .catch(() => {
      const worksheet = workbook.addWorksheet("리뷰");

      worksheet.addRow([
        "판매처",
        "상품명",
        "일자",
        "별점",
        "리뷰",
        "이름(아이디)",
        "연령대",
        "사용기간(한달사용기/재구매)",
        "피부타입",
        "피부고민",
        "자극도",
        "항목 1",
        "항목 2",
        "항목 3",
        "항목 4",
        "항목 5",
        "항목 6",
        "항목 7",
        "항목 8",
        "항목 9",
        "항목 10",
      ]);

      fillData(worksheet, reviewData, name);

      makeFile(workbook);
    });
};

module.exports = {
  OliveyoungExcel: OliveyoungExcel,
};

const valueChecker = (value) => {
  if (value) return value.trim();
  return "";
};

// 엑셀 파일 생성
const makeFile = async (workbook) => {
  await workbook.xlsx.writeFile(`./네이버최저가/최저가/최저가리스트.xlsx`);
};

const fillData = (worksheet, name, priceData) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  for (let i = 0; i < priceData.length; i += 1) {
    worksheet.addRow([
      valueChecker(`${year}-${month}-${day}-${hour}`),
      valueChecker(name),
      valueChecker(priceData[i].shopName),
      valueChecker(priceData[i].minPrice),
      valueChecker(priceData[i].deliveryPrice),
      valueChecker(priceData[i].link),
    ]);
  }
};

const NaverPriceComparisonExcel = (name, priceData) => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();

  workbook.xlsx
    .readFile(`./네이버최저가/최저가/최저가리스트.xlsx`)
    .then((res) => {
      const worksheet = res.getWorksheet("최저가");

      fillData(worksheet, name, priceData);

      makeFile(workbook);
    })
    .catch(() => {
      const worksheet = workbook.addWorksheet("최저가");

      worksheet.addRow([
        "다운로드 시각",
        "상품명",
        "가게명",
        "최저가",
        "배송비",
        "링크",
      ]);

      fillData(worksheet, name, priceData);

      makeFile(workbook);
    });
};

module.exports = {
  NaverPriceComparisonExcel: NaverPriceComparisonExcel,
};

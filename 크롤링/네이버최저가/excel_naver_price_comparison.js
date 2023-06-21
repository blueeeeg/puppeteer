const valueChecker = (value) => {
  if (value) return value.trim();
  return "";
};

// 엑셀 파일 생성
const makeFile = async (workbook, name) => {
  await workbook.xlsx.writeFile(`./네이버최저가/최저가/${name}.xlsx`);
};

const fillData = (worksheet, priceData) => {
  for (let i = 0; i < priceData.length; i += 1) {
    worksheet.addRow([
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
    .readFile(`./네이버최저가/최저가/${name}.xlsx`)
    .then((res) => {
      const worksheet = res.getWorksheet("최저가");

      fillData(worksheet, priceData);

      makeFile(workbook, name);
    })
    .catch(() => {
      const worksheet = workbook.addWorksheet("최저가");

      worksheet.addRow(["가게명", "최저가", "배송비", "링크"]);

      fillData(worksheet, priceData);

      makeFile(workbook, name);
    });
};

module.exports = {
  NaverPriceComparisonExcel: NaverPriceComparisonExcel,
};

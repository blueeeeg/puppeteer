// 엑셀 파일 생성
const makeFile = async (workbook) => {
  await workbook.xlsx.writeFile(`./공식몰/상품리스트.xlsx`);
};

const makePublicProductList = (productData) => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();
  console.log(12312321);
  const worksheet = workbook.addWorksheet("상품리스트");
  for (let i = 0; i < productData.length; i += 1) {
    worksheet.addRow([productData[i].name, productData[i].url]);
  }

  makeFile(workbook);
};

const getPublicProductList = async () => {
  const Excel = require("exceljs");
  const workbook = new Excel.Workbook();

  const product_list = [];
  await workbook.xlsx.readFile("./공식몰/상품리스트.xlsx").then((res) => {
    const worksheet = res.getWorksheet("상품리스트");

    let product_nbr = 1;
    while (true) {
      const [_, name, url] = worksheet.getRow(product_nbr).values;

      if (name) {
        product_list.push({ name, url });
        product_nbr += 1;
      } else break;
    }
  });

  return product_list;
};

module.exports = {
  makePublicProductList: makePublicProductList,
  getPublicProductList: getPublicProductList,
};

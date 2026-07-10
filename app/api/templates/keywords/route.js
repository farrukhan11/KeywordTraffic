import * as XLSX from "xlsx";

export async function GET() {
  const rows = [
    { "Store Name": "Nike", Keyword: "nike discount code", Country: "United Kingdom", Language: "English" },
    { "Store Name": "Nike", Keyword: "nike promo code", Country: "United Kingdom", Language: "English" },
    { "Store Name": "Adidas", Keyword: "adidas voucher code", Country: "United Kingdom", Language: "English" },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 24 }, { wch: 34 }, { wch: 22 }, { wch: 16 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Keyword Import");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=keyword-import-template.xlsx",
      "Cache-Control": "no-store",
    },
  });
}

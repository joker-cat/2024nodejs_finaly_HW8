const appError = require("./appError");

// patch 驗證 key 是否有另外屬性
const keyArray = [
  "user",
  "content",
  "type",
  "image",
  "likes",
  "comments",
  "tags",
];

function validateKey(keyParams) {
  if (keyParams.length === 0) return appError(400, "沒有傳入修改資料");
  for (const key of keyParams) {
    if (!keyArray.includes(key)) return appError(400, "有非規定屬性值");
  }
  return true;
}

module.exports = validateKey;

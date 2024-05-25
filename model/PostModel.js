// 連接資料庫
// 如果localhost連接失敗，請改成127.0.0.1，此問題可能為 node / npm 版本造成
const mongoose = require("mongoose");

const [schema, options] = [
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "關聯編號 未填寫"],
    },
    image: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "內容 未填寫"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      required: [true, "類別 未填寫"],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
  },
];

const postSchema = new mongoose.Schema(schema, options); // 設定Schema
const Post = mongoose.model("post", postSchema); // 關聯

module.exports = Post;

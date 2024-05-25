const express = require("express");
const { resSuccessWrite } = require("../service/resModule");
const validateKey = require("../service/validateModule");
const Post = require("../model/PostModel");
const appError = require("../service/appError");
const handErrorAsync = require("../service/handErrorAsync");
const postRouter = express.Router();


postRouter.get(`/posts`, handErrorAsync(async (req, res) => {
  const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
  const q = req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
  const data = await Post.find(q)
    .populate({
      path: "user",
      select: "name photo",
    })
    .sort(timeSort);
  resSuccessWrite(res, 200, data);
})
);

postRouter.post("/post", handErrorAsync(async (req, res, next) => {
  if (req.body.content == undefined || req.body.content.trim() === "") {
    return next(appError(400, "你沒有填寫 content 資料"));
  }
  if (req.body.type == undefined || req.body.type.trim() === "") {
    return next(appError(400, "你沒有填寫 type 資料"));
  }

  const newPost = await Post.create(req.body);
  resSuccessWrite(res, 200, [newPost]);
})
);

postRouter.patch("/post/:postId", handErrorAsync(async (req, res, next) => {
  const reqObj = req.body;
  const postId = req.params.postId.trim();
  const notFountKey = validateKey(Object.keys(reqObj));
  if (notFountKey?.name === 'Error') return next(notFountKey);
  const isNull = await Post.findByIdAndUpdate(postId, reqObj);
  if (isNull === null) return next(appError(400, "找不到資料"));
  resSuccessWrite(res, 200, "更新成功");
})
);

postRouter.delete("/post/:postId", handErrorAsync(async (req, res, next) => {
  const postId = req.params.postId.trim();
  if (postId === '') return next(appError(400, "找不到資料"));
  const isNull = await Post.findByIdAndDelete(postId);
  if (isNull === null) return next(appError(400, "找不到資料"));
  resSuccessWrite(res, 200, "刪除成功");
})
);

postRouter.delete("/posts", handErrorAsync(async (req, res, next) => {
  if (req.originalUrl !== "/posts") return next(appError(400, "清空失敗"));
  await Post.deleteMany({});
  resSuccessWrite(res, 200, "全部清空");
})
);

module.exports = postRouter;

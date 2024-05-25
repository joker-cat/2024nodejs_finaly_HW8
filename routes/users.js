const express = require("express");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../model/UserModel");
const appError = require("../service/appError");
const handErrorAsync = require("../service/handErrorAsync");
const { sendJWT, isAuth } = require("../service/statusHandles");
const userRouter = express.Router();


// 註冊
userRouter.post("/sign_up", handErrorAsync(async (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  if (!(name && email && password && confirmPassword)) return next(appError(400, "請確實填寫資訊", next));
  if (password.trim() !== confirmPassword.trim()) return next(appError(400, "密碼不一致！", next));
  const validateName = validator.isEmpty(name.trim());
  if (validateName) return next(appError(400, "名稱未填寫"));
  const validateEmail = validator.isEmail(email.trim());
  if (!validateEmail) return next(appError(400, "信箱格式錯誤"));
  const validatePsd = validator.isByteLength(password.trim(), { min: 6, max: 18 });
  if (!validatePsd) return next(appError(400, "密碼需介於 6-18 字元之間"));

  //信箱是否註冊過
  const user = await User.findOne({ email });
  if (user) return next(appError(400, "信箱已註冊過"));

  //通過驗證後，將密碼加密
  password = await bcrypt.hash(password, 12);
  //建立使用者
  const data = await User.create({ name, email, password });

  sendJWT(data, 201, res);
}
));

// 登入
userRouter.post("/sign_in", handErrorAsync(async (req, res, next) => {
  let { email, password } = req.body;
  const validateEmail = validator.isEmpty(email.trim());
  if (validateEmail) return next(appError(400, "郵件未填寫"));
  const validatePsd = validator.isEmail(password.trim());
  if (validatePsd) return next(appError(400, "密碼未填寫"));
  const isUser = await User.findOne({ email });
  if (!isUser) return next(appError(400, "帳號或密碼錯誤"));

  // password原本為隱藏，透過select('+password')顯示取得
  const user = await User.findOne({ email }).select('+password');
  // 輸入密碼與雜湊密碼比對
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) return next(appError(400, "密碼錯誤"));

  sendJWT(user, 201, res);
}
));

//找回密碼
userRouter.post("/updatePassword", isAuth, handErrorAsync(async (req, res, next) => {
  //再次檢查是否有登入，即將更改密碼
  if (req.user === undefined) return next(appError(401, '你尚未登入！', next));

  let newPassword = null;
  const { password, confirmPassword } = req.body;

  if (password.trim() !== confirmPassword.trim()) return next(appError(400, "密碼不一致！", next));
  if (!validator.isByteLength(password.trim(), { min: 6, max: 18 })) return next(appError(400, "密碼需介於 6-18 字元之間"));

  //加密密碼
  newPassword = await bcrypt.hash(password, 12);
  //更新密碼
  const user = await User.findByIdAndUpdate(req.user.id, {
    password: newPassword
  });

  sendJWT(user, 200, res);
}
));

//找回密碼
userRouter.get("/profile", isAuth, handErrorAsync(async (req, res, next) => {
  //再次檢查是否有登入，即將更改密碼
  if (req.user === undefined) return next(appError(401, '你尚未登入！', next));
  const user = await User.findById(req.user.id);
  res.status(201).json({
    status: 'success',
    user
  });
}
));


//更新個人資料
userRouter.patch("/profile", isAuth, handErrorAsync(async (req, res, next) => {

  if (req.user === undefined) return next(appError(401, '你尚未登入！'));
  //檢查是否有修改密碼到
  const updateKeys = Object.keys(req.body);
  if (updateKeys.includes('password')) return next(appError(400, '只允許修改基本個資'));

  const user = await User.findByIdAndUpdate(req.user.id, req.body);
  sendJWT(user, 200, res);
}
));

module.exports = userRouter;

var express = require('express');
var router = express.Router();

const moment = require("moment");
const { Buffer } = require("buffer");
const OSS = require("ali-oss");

const path = require("path");

const config = {
  accessKeyId: "LTAI5tQy7h28T8PAe52qBnw3",
  accessKeySecret: "14zisvUfnUfZeyHLjf4TpTY8CWOxp9",
  bucket: "osslearning5",
  // callbackUrl: "url",
  dir: "prefix/",
};

router.get("/", async (req, res) => {
  const client = new OSS(config);

  const date = new Date();
  date.setDate(date.getDate() + 1);
  const policy = {
    expiration: date.toISOString(), // 请求有效期
    conditions: [
      ["content-length-range", 0, 1048576000], // 设置上传文件的大小限制
      // { bucket: client.options.bucket } // 限制可上传的bucket
    ],
  };

  //  跨域才设置
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "PUT,POST,GET",
  });

  //签名
  const formData = await client.calculatePostSignature(policy);
  //bucket域名
  const host = `http://${config.bucket}.${
    (await client.getBucketLocation()).location
  }.aliyuncs.com`.toString();
  //回调
  // const callback = {
  //   callbackUrl: config.callbackUrl,
  //   callbackBody:
  //     "filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}",
  //   callbackBodyType: "application/x-www-form-urlencoded",
  // };

  //返回参数
  const params = {
    expire: moment().add(1, "days").unix().toString(),
    policy: formData.policy,
    signature: formData.Signature,
    accessid: formData.OSSAccessKeyId,
    host,
    // callback: Buffer.from(JSON.stringify(callback)).toString("base64"),
    dir: config.dir,
  };

  res.json(params);
});
module.exports = router;

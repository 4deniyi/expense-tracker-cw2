// src/functions/CreateExpense.js
const { ensureBlobContainer } = require("./shared");

module.exports = async function (context, req) {
  context.log("CreateExpense invoked");

  try {
    const body = req.body || {};
    context.res = {
      status: 200,
      jsonBody: { message: "OK", body }
    };
  } catch (err) {
    context.log(err);
    context.res = {
      status: 500,
      jsonBody: { error: err.message }
    };
  }
};

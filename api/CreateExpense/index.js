const {
  cosmos,
  ensureBlobContainer,
  uploadBase64Image,
  notifyLogicApp
} = require("../shared");

module.exports = async function (context, req) {
  try {
    await ensureBlobContainer();

    const body = req.body || {};
    const {
      userId,
      amount,
      category,
      date,
      description,
      receiptBase64,
      receiptContentType
    } = body;

    if (!userId || amount === undefined || !category || !date) {
      context.res = {
        status: 400,
        jsonBody: { message: "userId, amount, category, date are required" }
      };
      return;
    }

    let receiptUrl = null;
    if (receiptBase64) {
      receiptUrl = await uploadBase64Image(receiptBase64, receiptContentType);
    }

    const now = new Date().toISOString();
    const expense = {
      id: require("uuid").v4(),
      userId,
      amount: Number(amount),
      category,
      date,
      description: description || "",
      receiptUrl,
      createdAt: now,
      updatedAt: now
    };

    const { container } = cosmos();
    await container.items.create(expense);
    await notifyLogicApp(expense);

    context.res = { status: 201, jsonBody: expense };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, jsonBody: { message: err.message } };
  }
};

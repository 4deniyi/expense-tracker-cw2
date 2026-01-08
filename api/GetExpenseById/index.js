const { cosmos } = require("../shared");

module.exports = async function (context, req) {
  try {
    const id = context.bindingData.id;
    const userId = req.query.userId;

    if (!id || !userId) {
      context.res = { status: 400, jsonBody: { message: "id route + userId query are required" } };
      return;
    }

    const { container } = cosmos();
    const { resource } = await container.item(id, userId).read();

    if (!resource) {
      context.res = { status: 404, jsonBody: { message: "Not found" } };
      return;
    }

    context.res = { status: 200, jsonBody: resource };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, jsonBody: { message: err.message } };
  }
};

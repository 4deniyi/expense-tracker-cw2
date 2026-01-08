const { cosmos } = require("../shared");

module.exports = async function (context, req) {
  try {
    const id = context.bindingData.id;
    const body = req.body || {};
    const { userId } = body;

    if (!id || !userId) {
      context.res = { status: 400, jsonBody: { message: "id route + userId in body are required" } };
      return;
    }

    const { container } = cosmos();
    const { resource } = await container.item(id, userId).read();

    if (!resource) {
      context.res = { status: 404, jsonBody: { message: "Not found" } };
      return;
    }

    const updated = {
      ...resource,
      amount: body.amount !== undefined ? Number(body.amount) : resource.amount,
      category: body.category || resource.category,
      date: body.date || resource.date,
      description: body.description !== undefined ? body.description : resource.description,
      updatedAt: new Date().toISOString()
    };

    await container.item(id, userId).replace(updated);
    context.res = { status: 200, jsonBody: updated };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, jsonBody: { message: err.message } };
  }
};

const { cosmos } = require("../shared");

module.exports = async function (context, req) {
  try {
    const userId = req.query.userId;
    if (!userId) {
      context.res = { status: 400, jsonBody: { message: "userId query is required" } };
      return;
    }

    const { container } = cosmos();
    const query = {
      query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.date DESC",
      parameters: [{ name: "@userId", value: userId }]
    };

    const { resources } = await container.items.query(query).fetchAll();
    context.res = { status: 200, jsonBody: resources };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, jsonBody: { message: err.message } };
  }
};

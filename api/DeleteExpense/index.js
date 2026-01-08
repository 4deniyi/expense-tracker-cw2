const { cosmos, blob } = require("../shared");

function blobNameFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    return parts.slice(2).join("/"); 
  } catch {
    return null;
  }
}

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

    if (resource.receiptUrl) {
      const name = blobNameFromUrl(resource.receiptUrl);
      if (name) {
        const { container: blobContainer } = blob();
        await blobContainer.getBlobClient(name).deleteIfExists();
      }
    }

    await container.item(id, userId).delete();
    context.res = { status: 204 };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, jsonBody: { message: err.message } };
  }
};

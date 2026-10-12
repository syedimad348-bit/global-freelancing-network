/** True only for a 24-char hex Mongo ObjectId string (not offline-* ids). */
function isMongoObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

module.exports = { isMongoObjectId };

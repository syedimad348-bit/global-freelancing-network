let latestSync = {
  startedAt: null,
  endedAt: null,
  success: true,
  failedSources: [],
  sourceStats: {},
  insertedCount: 0,
};

function beginSync() {
  latestSync = {
    ...latestSync,
    startedAt: new Date().toISOString(),
    endedAt: null,
    success: true,
    failedSources: [],
    sourceStats: {},
    insertedCount: 0,
  };
}

function sourceDone(name, insertedCount, error = null) {
  latestSync.sourceStats[name] = { insertedCount, ok: !error, error: error || null };
  if (error) {
    latestSync.success = false;
    latestSync.failedSources.push(name);
  } else {
    latestSync.insertedCount += insertedCount;
  }
}

function endSync() {
  latestSync.endedAt = new Date().toISOString();
}

function getSyncState() {
  return latestSync;
}

module.exports = {
  beginSync,
  sourceDone,
  endSync,
  getSyncState,
};

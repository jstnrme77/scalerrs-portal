// 1️⃣  clientId MUST be supplied by the UI
const clientId = req.query.clientId as string;

// still continue even when the id is "all"
if (!clientId || clientId === 'all') {
  return res.status(400).json({ error: 'clientId is mandatory (not "all")' });
}

// build Airtable formula --------------------------------------------
const formula =
  `AND(` +
    `FIND('${clientId}', ARRAYJOIN({Clients}, ',')) > 0,` + // limit to 1 client
    `{${approvalField}}`                                     // status not empty
  `)`;

// cache key ----------------------------------------------------------
const cacheKey = `approvals_${type}_${page}_${pageSize}__client_${clientId}`; 
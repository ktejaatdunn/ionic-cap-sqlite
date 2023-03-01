-- Headers

CREATE TABLE IF NOT EXISTS headers (
  id TEXT PRIMARY KEY,
  contract TEXT,
  contractBranch INTEGER,
  customerAddress TEXT,
  customerName TEXT,
  plannedActDate TEXT,
  actualActDate TEXT,
  vapsStatus TEXT,
  vapsStatusDescription TEXT,
  syncStatus TEXT,
  message TEXT,
  serial TEXT,
  serialDescription TEXT,
  userId TEXT,
  createdAt TEXT,
  updatedAt TEXT,
);

INSERT INTO header (id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

select * from headers;


-- Materials

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  headerInfoId TEXT,
  itemNumber INTEGER,
  material TEXT,
  materialDescription TEXT,
  uom TEXT,
  qtyOrdered INTEGER,
  qtyIssued INTEGER,
  qtyDelivered INTEGER,
  qtyToIssued INTEGER,
  stockAvail TEXT,
  instrToloader TEXT,
  pgi TEXT,
  defaultBranch INTEGER,
  contract TEXT,
  contractBranch INTEGER,
  fulFillmentBranch INTEGER,
  syncStatus TEXT,
  message TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  FOREIGN KEY (headerInfoId) REFERENCES header(id)
);

INSERT INTO material (id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)


select * from materials;
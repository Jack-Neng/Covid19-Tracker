// Create Indexes
db.canadacases.createIndex({ prname: 1, date: 1 }, { unique: true });
db.globalcases.createIndex({ Country: 1, Date_reported: 1 }, { unique: true });

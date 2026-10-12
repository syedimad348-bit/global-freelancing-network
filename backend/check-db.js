require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
mongoose.connect(process.env.MONGO_URL).then(async () => {
  const total = await Job.countDocuments({});
  console.log("Total:", total);
  const withPosted = await Job.countDocuments({ postedAt: { $ne: null } });
  console.log("With postedAt:", withPosted);
  const remote = await Job.countDocuments({ remoteType: { $ne: "onsite" } });
  console.log("Remote != onsite:", remote);
  const remoteWWR = await Job.countDocuments({ source: "WeWorkRemotely", remoteType: { $ne: "onsite" } });
  console.log("WWR remote:", remoteWWR);
  const oldest = await Job.findOne().sort({ fetchedAt: 1 });
  console.log("Oldest fetched:", oldest?.fetchedAt);
  mongoose.disconnect();
}).catch(e => console.error(e));
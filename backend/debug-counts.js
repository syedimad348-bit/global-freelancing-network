require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job');

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const total = await Job.countDocuments({});
  console.log('Total jobs:', total);
  
  const fresh = new Date();
  fresh.setHours(fresh.getHours() - 3);
  console.log('Min postedAt (3h):', fresh.toISOString());
  
  const f1 = await Job.countDocuments({ postedAt: { $gte: fresh } });
  console.log('postedAt >= 3h:', f1);
  
  const f2 = await Job.countDocuments({ postedAt: null, fetchedAt: { $gte: fresh } });
  console.log('postedAt=null AND fetchedAt >= 3h:', f2);
  
  const combined = {
    remoteType: { $ne: 'onsite' },
    $or: [
      { postedAt: { $gte: fresh } },
      { postedAt: null, fetchedAt: { $gte: fresh } },
    ]
  };
  const f3 = await Job.countDocuments(combined);
  console.log('remoteType != onsite + freshness:', f3);
  
  const f4 = await Job.countDocuments({ remoteType: { $ne: 'onsite' } });
  console.log('remoteType != onsite:', f4);
  
  // Sample a job to see field values
  const sample = await Job.findOne();
  console.log('Sample job:', {
    title: sample?.title,
    source: sample?.source,
    postedAt: sample?.postedAt,
    fetchedAt: sample?.fetchedAt,
    remoteType: sample?.remoteType,
    country: sample?.country,
  });
  
  // Check how many jobs have postedAt null vs set
  const withPosted = await Job.countDocuments({ postedAt: { $ne: null } });
  const withoutPosted = await Job.countDocuments({ postedAt: null });
  console.log('With postedAt:', withPosted);
  console.log('Without postedAt:', withoutPosted);
  
  // Check postedAt distribution by age
  const now = Date.now();
  const oneHourAgo = new Date(now - 3600000);
  const recent = await Job.countDocuments({ postedAt: { $gte: oneHourAgo } });
  console.log('postedAt within 1h:', recent);
  
  mongoose.disconnect();
}).catch(e => console.error(e));

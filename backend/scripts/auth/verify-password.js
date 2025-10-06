const bcryptjs = require('bcryptjs');

const password = 'Password123!';
const hash = '$2a$10$kFyvImjxXcsqoDpThXmxl.3egeF6UqbYv0ZMe7xkbrD0GnE.46dSW';

bcryptjs.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password matches:', result);
  }
});

// Also create a new hash to compare
const newHash = bcryptjs.hashSync(password, 10);
console.log('New hash:', newHash);
console.log('Comparing with new hash:', bcryptjs.compareSync(password, newHash));
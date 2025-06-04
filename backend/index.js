require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const helmet = require('helmet');

const keys = require('./config/keys');
const socket = require('./socket');
const setupDB = require('./utils/db');

const { port } = keys;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: true
  })
);
app.use(cors());

// ✅ Setup DB and Passport before routes
setupDB();
require('./config/passport')(app);

// ✅ Mount cleanly scoped API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// 🚫 REMOVE this if it contains fallback junk
// const routes = require('./routes');
// app.use(routes);  // comment or delete unless really needed

const server = app.listen(port, () => {
  console.log(
    `${chalk.green('✓')} ${chalk.blue(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
    )}`
  );
});

socket(server);

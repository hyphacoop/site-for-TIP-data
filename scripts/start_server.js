const express = require('express');
const path = require('path');

const app = express();
const siteRoot = path.join(__dirname, '..', 'site');

app.use(express.static(siteRoot));

const PORT = 8080;
app.listen(PORT);

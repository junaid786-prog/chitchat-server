const express = require('express');
const { connect } = require('./lib/db/db');
const indexRouter = require('./routes/index.route');
const ErrorMiddleware = require('./middelwares/ErrorMiddleware');
const allowedHeaders = require('./utils/headers');

const app = express();
connect();

app.use((req, res, next) => {
    express.json()(req, res, next);
});


app.use(/.*/, allowedHeaders);
app.use("/api", indexRouter);

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use(ErrorMiddleware)
module.exports = app;
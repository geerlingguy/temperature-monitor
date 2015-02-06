module.exports = function(app) {
    app.use('/', require('./routes/home'));
    app.use('/sensors', require('./routes/sensors'));
    app.use('/temps', require('./routes/temps'));
}

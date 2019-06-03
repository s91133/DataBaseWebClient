var Sql = require('./routes/get_data_from_database');
var connect_info = {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'new_schema'
}
//*/

'use strict';
var cors = require('cors');

var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var example = new Sql(connect_info);
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', routes);
app.use('/users', users);
// 須可以 a. 新增書籍 b.刪除書籍 c.轉移書籍( 分館到分館 )
//查詢每一本書的借閱狀況
//查詢每一位借閱者的借書狀況
//列出某一分館的借書狀況
//列出超時未還的書名及借閱人名(某一分館or全部)
//以書名查詢哪一分館有此書

// add new book to database

// 以書名查詢哪一分館有此書
//查詢每一本書的借閱狀況

app.get('/bookinfo', function (req, res) {
    //res.send('bookinfo')
    example.getbook(req.query.title).then(function (result) {
        //console.log(result);
        res.json({ result: result })
    });
    
});
// 列出某一分館的借書狀況
app.get('/library', function (req, res) {
    //res.send(req.body.library)
    //console.log(req.query.library)
    example.getlibr(req.query.branchid).then(function (result) {
        //console.log(result);
        res.json({ result: result })
    });
});
//列出超時未還的書名及借閱人名(all)
app.get('/overtime', function (req, res) {
    example.getover().then(function (result) {
        //console.log(result);
        res.json({ result: result })
    });
});
//查詢館藏overtime
app.get('/overtimebranch', function (req, res) {
    example.getoverfrombranch(req.query.branchid).then(function (result) {
        //console.log(result);
        res.json({ result: result })
    });
});

// search book state (borrow & where) input book return book state

//查詢每一位借閱者的借書狀況
app.get('/borrow', function (req, res) {
     
    example.getborr(req.query.name).then(function (result) {
        //console.log(result);
        res.json({ result: result })
    }); 
     
});
//借書
app.get('/borrowbook', function (req, res) {

    example.borrowBook(req.query.bookid, req.query.branchid, req.query.cardno).then(function (result) {
    });


});
//還書
app.get('/returnbook', function (req, res) {
    example.returnBook(req.query.bookid, req.query.branchid , req.query.cardno).then(function (result) {
    });
});
//新增書
app.get('/addbook', function (req, res) {
    example.addBook(req.query.bookid, req.query.title, req.query.publisher, req.query.branchid ).then(function (result) {

        console.log('add ok');
        res.send('add ok!')
    }).catch(function (error) {

        console.log('add fail');
        res.send('add fail!')
    });
});


//刪除書
app.get('/delete', function (req, res) {

    res.send('delete finish')
    example.deleteBook(req.query.bookid, req.query.branchid).then(function (reulst) {
        
    });
    

});

//轉移書到(由branchid1到id2)

app.get('/move', function (req, res) {
    example.addBook(req.query.bookid, 0,0, req.query.branchid2).then(function (result) {

        example.deleteBook(req.query.bookid, req.query.branchid1).then(function (reulst) {
          //  res.send('trans ok');
        });

    }).catch(function (error) {

       // res.send('trans fail');
    });
    res.send('trans ok');

});

/*
內建錯誤訊息 & port
*/
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});




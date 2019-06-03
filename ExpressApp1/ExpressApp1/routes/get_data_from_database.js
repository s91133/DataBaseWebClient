/*

*/

function Sql_operator(connect_info) {
    this.connect_info = connect_info;
}

Sql_operator.mysql = require('mysql');

Sql_operator.Gt = {
    getBooks: 'book',
    getAuthors: 'book_authors',
    getCopies: 'book_copies',
    getLoans: 'book_loans',
    getBorrowers: 'borrower',
    getBranches: 'library_branch',
    getPublishers: 'publisher'

};

Sql_operator.Br = {
    getBr1: 'TPEL01',
    getBr2: 'TPEL02',
    getBr3: 'TPEL03',
    getBr4: 'TPEL04',
    getBr5: 'TPEL05',
    getBr6: 'TPEL06'

};

Sql_operator.prototype.connect = function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        let connection = Sql_operator.mysql.createConnection(self.connect_info);

        connection.connect(function (err) {
            if (err) {
                reject(err);
            } else {
                console.log('database Connected!');
                resolve(connection);
            }
        });
    });
};

Sql_operator.prototype.getTable = function (get_target) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {
            let sql = 'SELECT * FROM ' + get_target;
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};


Sql_operator.prototype.getover = function () {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {
            let sql = 'SELECT book.title, book_loans.CardNo, borrower.name , book_loans.dueDate  FROM book_loans\
                        INNER JOIN book ON book_loans.BookId=book.BookId  INNER JOIN borrower ON book_loans.CardNo=borrower.CardNo \
                        INNER JOIN library_branch ON book_loans.branchid=library_branch.branchid  WHERE   dueDate < NOW() ';
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};
Sql_operator.prototype.getoverfrombranch = function (branchid) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {
            let sql = "SELECT book.title , borrower.name, book_loans.dueDate   FROM book_loans INNER JOIN book ON book_loans.BookId=book.BookId  INNER JOIN borrower ON book_loans.CardNo=borrower.CardNo \
                           WHERE   dueDate < NOW() AND  branchid =    \"" + branchid + "\" ";
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};

Sql_operator.prototype.getborr = function (name) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {
            let sql = "SELECT borrower.CardNo, borrower.name, book.title, library_branch.branchname ,book_loans.dueDate,book_loans.dateout FROM borrower \
                        LEFT OUTER JOIN book_loans ON book_loans.CardNo=borrower.CardNo LEFT OUTER JOIN book ON book_loans.BookId=book.BookId  \
                        LEFT OUTER JOIN library_branch ON book_loans.branchid=library_branch.branchid  WHERE name LIKE    \"%" + name + "%\"  ";
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};



Sql_operator.prototype.getbook = function (title) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {
            let sql = "SELECT book.bookid, book.title, book.publisherName, library_branch.branchname,book_copies.No_Of_Copies ,book_loans.dateout, book_loans.duedate \
                        FROM book  INNER JOIN book_copies ON  book.bookid = book_copies.bookid  INNER JOIN library_branch ON \
                       library_branch.branchid = book_copies.branchid \
                        LEFT OUTER JOIN book_loans ON book.bookid=book_loans.bookid  WHERE title LIKE    \"%" + title + "%\"  ";
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};

 

Sql_operator.prototype.getlibr = function (name) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {//
            let sql = "SELECT book.title, book_copies.No_Of_Copies, book_loans.dateout, book_loans.dueDate FROM  book_copies \
            LEFT OUTER JOIN book_loans ON book_loans.BookId=book_copies.BookId INNER JOIN book ON book_copies.BookId=book.BookId  \
             INNER JOIN library_branch ON library_branch.branchid = book_copies.branchid  WHERE library_branch.branchname  LIKE    \"%" + name + "%\"  ";
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            connection.end();
        });
    });
};





Sql_operator.prototype.addBook = function (id, title, publisher, branch) {

    let self = this;

    return new Promise(function (resolve, reject) {

        self.connect().then(function (connection) {

            let sql = "SELECT BookId FROM book WHERE BookId = \"" + id + "\""; // sql for test if book exits.
            connection.query(sql, function (err, result) {

                if (err) {

                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } // if 
                else { // sql success

                    if (result.length == 0) { // book not exist

                        sql = "INSERT INTO book ( bookid, title, publisherName ) VALUES ( \"" + id + "\", \"" + title + "\", \"" + publisher + "\")";
                        connection.query(sql, function (err, result) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                reject(err);
                            } // if
                        });

                        sql = "INSERT INTO BOOK_COPIES ( BookId, BranchId, No_Of_Copies ) VALUES ( \"" + id + "\", \"" + branch + "\", 1 )";
                        connection.query(sql, function (err, result) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                reject(err);
                            } // if
                            else {
                                resolve(1);
                            } // else
                        }); // query()

                    } // if
                    else { // book is exist.

                        sql = "SELECT No_Of_Copies FROM BOOK_COPIES WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
                        connection.query(sql, function (err, result) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                reject(err);
                            } // if
                            else {
                                if (result.length == 0) { // booid is not exist in BOOK_COPIES

                                    sql = "INSERT INTO BOOK_COPIES ( BookId, BranchId, No_Of_Copies ) VALUES ( \"" + id + "\", \"" + branch + "\", 1 )";
                                    connection.query(sql, function (err, result) {
                                        if (err) {
                                            console.log('[SELECT ERROR] - ', err.message);
                                            reject(err);
                                        } // if
                                        else {
                                            resolve(1);
                                        } // else
                                    }); // query()

                                } // if
                                else { // booid is currently exist in BOOK_COPIES
                                    let num = result[0].No_Of_Copies + 1;
                                    sql = "UPDATE BOOK_COPIES SET No_Of_Copies = \"" + num + "\" WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
                                    connection.query(sql, function (err, result) {
                                        if (err) {
                                            console.log('[SELECT ERROR] - ', err.message);
                                            reject(err);
                                        } // if
                                        else {
                                            resolve(1);
                                        } // else

                                    }); // query()

                                } // else

                            } // else

                        }); // query()

                    } // else

                } //else

            }); // query()

        }); // connect().then()

    }); // Promise()

} // addBook()

Sql_operator.prototype.deleteBook = function (id, branch) {

    let self = this;

    return new Promise(function (resolve, reject) {

        self.connect().then(function (connection) {

            let sql = "SELECT No_Of_Copies FROM BOOK_COPIES WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
            connection.query(sql, function (err, result) {

                if (err) {

                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } // if 
                else { // sql success
                    if (result.length == 0) { // no such book in the branch
                        console.log('The book is not exist in the branch.');
                        reject(err);
                    } // if
                    else {
                        if (result[0].No_Of_Copies == '1') {

                            console.log('delete only one book in this branch');
                            let sql = "DELETE FROM BOOK_COPIES WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
                            connection.query(sql, function (err, result) {
                                if (err) {

                                    console.log('[SELECT ERROR] - ', err.message);
                                    reject(err);
                                } // if 
                                else { // sql success
                                } // else

                            }); // query()
                        } // if
                        else {
                            console.log('delete one of this book in this branch');
                            let num = result[0].No_Of_Copies - 1;
                            let sql = "UPDATE BOOK_COPIES SET No_Of_Copies = \"" + num + "\" WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
                            connection.query(sql, function (err, result) {
                                if (err) {

                                    console.log('[SELECT ERROR] - ', err.message);
                                    reject(err);
                                } // if 
                                else { // sql success
                                } // else

                            }); // query()
                        } // else


                        // if the book doesn't in all branch delete book in book table
                        let sql = "SELECT No_Of_Copies FROM BOOK_COPIES WHERE BookId = \"" + id + "\"";
                        connection.query(sql, function (err, result) {

                            if (err) {

                                console.log('[SELECT ERROR] - ', err.message);
                                reject(err);
                            } // if 
                            else { // sql success
                                if (result.length == 0) {
                                    console.log('The book num is 0. delete it from book table ');
                                    let sql = "DELETE FROM Book WHERE BookId = \"" + id + "\"";
                                    connection.query(sql, function (err, result) {
                                        if (err) {

                                            console.log('[SELECT ERROR] - ', err.message);
                                            reject(err);
                                        } // if 
                                        else { // sql success

                                        } // else

                                    }); // query()

                                } // if 

                            } // else

                        }); // query()

                    } // else

                } // else

            }); // query()

        }); // connect().then()

    }); // Promise()

} // deleteBook() 


Sql_operator.prototype.borrowBook = function (id, branch, cardid) {

    let self = this;

    return new Promise(function (resolve, reject) {

        self.connect().then(function (connection) {

            let sql = "SELECT * FROM BOOK_LOANS WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
            connection.query(sql, function (err, result) {

                if (err) {

                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } // if 
                else {
                    var num = result.length;
                    sql = "SELECT No_Of_Copies FROM BOOK_COPIES WHERE BookId = \"" + id + "\" AND BranchId = \"" + branch + "\"";
                    connection.query(sql, function (err, result) {
                        if (err) {

                            console.log('[SELECT ERROR] - ', err.message);
                            reject(err);
                        } // if 
                        else {
                            if (num == result.length) {
                                console.log('This book in this branch are all already borrowed');
                            }  // if
                            else {
                                sql = "INSERT INTO BOOK_LOANS ( BookId, BranchId, CardNo, DateOut, DueDate ) VALUES ( \"" + id + "\", \"" + branch + "\", \"" + cardid + "\", CURDATE(), DATE_ADD( CURDATE(), INTERVAL 30 DAY) )";
                                console.log(sql);
                                connection.query(sql, function (err, result) {
                                    if (err) {

                                        console.log('[SELECT ERROR] - ', err.message);
                                        reject(err);
                                    } // if 
                                    else {
                                        resolve(1);
                                    } //esle

                                }); // query()
                            } // else

                        } // else

                    }); // query()

                } // else

            }); // query()

        }); // connect().then()

    }); // promise()

};// borrowBook()


Sql_operator.prototype.returnBook = function (id,branchid ,cardid) {

    let self = this;

    return new Promise(function (resolve, reject) {
        self.connect().then(function (connection) {

            let sql = "DELETE FROM BOOK_LOANS WHERE BookId = \"" + id + "\" AND branchid = \"" + branchid + "\" AND CardNo = \"" + cardid + "\"";
            connection.query(sql, function (err, result) {

                if (err) {

                    console.log('[SELECT ERROR] - ', err.message);
                    reject(err);
                } // if 
                else { // sql success
                    console.log('returned finish!');
                    resolve(1);
                } // else


            }); // query() 

        }); // connect().then()

    });// promise()

};  // returnBook()


module.exports = Sql_operator;



 
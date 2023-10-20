/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const expect = require('chai').expect;
const mongoose = require('mongoose');
const mongodb = require('mongodb');

module.exports = function (app) {
  
  mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true });

  const bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    comments: [String]
  });

  const Book = mongoose.model('Book', bookSchema);

  
  app.route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks = [];
      let results = await Book.find({});
      try {
        if (results) {
          results.forEach((result) => {
            let book = result.toJSON()
            book['commentcount'] = book.comments.length;
            arrayOfBooks.push(book);
          });
          return res.json(arrayOfBooks);
        }
        } catch (error) {
        console.log(error);
      }
    })
    
    .post(async (req, res) => {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title) {
        return res.send('missing required field title');
      }
      const newBook = new Book({
        title: title,
        comments: []
      });
      const savedBook = await newBook.save();
      return res.json(savedBook);
    })
    
    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      let results = await Book.deleteMany({});
      if(results.deletedCount > 0) {
        res.send('complete delete successful');
      } else {
        res.send('no book exists');
      }
    });



  app.route('/api/books/:id')
    .get(async (req, res) => {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let result = await Book.findById(bookid);
      if(!bookid) {
        res.send('no book exists');
      } else {
        if(!result) {
          res.send('no book exists');
        } else {
          return res.json(result);
        }
      }
    })
    
    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      let updatedBook = await Book.findByIdAndUpdate(
        bookid,
        {$push: {comments: comment}},
        {new: true}
      ); 
      if(!bookid){
        res.send('missing required field title')
      }else{
        if(!comment){
          res.send('missing required field comment')
        }else{
          if(!updatedBook){
            res.send('no book exists')
          }else{
            res.json(updatedBook);
        }
        }
      }
    })
    
    .delete(async (req, res) => {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      let deletedBook = await Book.findByIdAndRemove(bookid);
      try {
        if(!bookid) {
          res.send('no book exists');
        } else {
          if(!deletedBook) {
            res.send('no book exists');
          } else {
            res.send('delete successful');
          }
        }
      } catch(err) {
        console.log(err);
      }
    })
}
const express = require("express")
const BookModel = require("../models/books")
const { default: mongoose } = require("mongoose")

const routes = express.Router()

//Get All Books
routes.get("/books", (req, res) => {
    BookModel.find()
        .then((books) => {
            res.status(200).json({
                status: true,
                message: "Books fetched successfully",
                count: books.length,
                data: books
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: err.message
            })
        })
})


//Add NEW Book
routes.post("/books", async (req, res) => {
    const newBookData = req.body
    try {
            const newBookModel = new BookModel(newBookData)
            const newBook = await newBookModel.save()
            res.status(200).json({
                status: true,
                message: "New Book added successfully",
                data: newBook
            })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }

})

//Update existing Book By Id
routes.put("/book/:bookid", async (req, res) => {
    const bookId = req.params.bookid
    const updateData = req.body

    try {
        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).json({
                status: false,
                message: "Invalid Book ID"
            })
        }

         //logic to update book by id
        const updatedBook = await BookModel.findByIdAndUpdate(bookId, updateData, {new: true})
        if(!updatedBook) {
            return res.status(404).json({
                status: false,
                message: `Book not found for id: ${bookId}`
            })
        }

        res.status(200).json({
            status: true,
            message: `Book updated successfully for id: ${bookId}`,
            data: updatedBook,
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})
   

//Delete Book By ID
routes.delete("/book/:bookid", async (req, res) => {
    const bookId = req.params.bookid

    try {
        if(!mongoose.Types.ObjectId.isValid(bookId)){
            return res.status(400).json({
                status: false,
                message: "Invalid Book ID"
            })
        }
        
         //logic to delete book by id
         const deletedBook = await BookModel.findByIdAndDelete(bookId)
         if(!deletedBook) {
             return res.status(404).json({
                 status: false,
                 message: `Book not found for id: ${bookId}`
             })
         }

        res.status(200).json({
            status: true,
            message: `Book deleted successfully for id: ${bookId}`,
            data: deletedBook,
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

//Get Book By ID
routes.get("/book/:bookid", async (req, res) => {
    const bookId = req.params.bookid

    if(!mongoose.Types.ObjectId.isValid(bookId)){
        return res.status(400).json({
            status: false,
            message: "Invalid Book ID"
        })
    }
    
    //logic to get book by id
    const book = await BookModel.findById(bookId)
    //const book = await BookModel.findOne({_id: bookId})
    //const book = await BookModel.findOne({title: 'book title 2'})
    //const book = await BookModel.find({_id: bookId})

    if(!book) {
        return res.status(404).json({
            status: false,
            message: `Book not found for id: ${bookId}`
        })
    }

    res.status(200).json({
        status: true,
        message: `Book fetched successfully for id: ${bookId}`,
        data: book,
    })
   
})

// GET /books/page?_page=1&_limit=10&q=harry
routes.get("/books/page", async (req, res) => {
  try {
    let { _page = "1", _limit = "10", q = "" } = req.query;

    const page = Math.max(parseInt(_page, 10) || 1, 1);
    // put a sane upper-bound on limit to protect the DB
    const limit = Math.min(Math.max(parseInt(_limit, 10) || 10, 1), 100);

    // Build filter
    const filter = {};
    if (q && String(q).trim().length > 0) {
      // Escape regex special chars and do case-insensitive partial match
      const escaped = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [{ title: rx }, { author: rx }];
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      BookModel.countDocuments(filter),
      BookModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 }) // newest first; adjust as needed
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.setHeader('X-Total-Count', total);
    res.status(200).json({
      status: true,
      message: "Books fetched successfully",
      page,
      limit,
      total,         // total matching documents
      totalPages,
      count: data.length, // number returned in this page
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});


//Get All Books in sorted order
routes.get("/books/sort", async (req, res) => {

    try {
        const books = await BookModel.find().sort({title: -1}) //1 for ascending order, -1 for descending order
        res.status(200).json({
            status: true,
            message: "Books fetched and sorted successfully",
            count: books.length,
            data: books
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})

module.exports = routes
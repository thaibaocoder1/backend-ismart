const Comment = require('../models/Comment');
const status = require('http-status-codes');

class CommentController {
  async index(req, res, next) {
    try {
      const comments = await Comment.find({}).populate('userID');
      if (comments) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: comments.length,
          comments,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có bình luận nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin bình luận.',
      });
    }
  }
  async add(req, res, next) {
    try {
      const { productID, userID, text } = req.body;
      if (productID && userID) {
        const comment = await Comment.create(req.body);
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: comment,
        });
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lưu thông tin bình luận.',
      });
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (id) {
        await Comment.deleteOne({ _id: id });
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: {
            message: 'Delete success!',
          },
        });
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xoá thông tin bình luận.',
      });
    }
  }
}
module.exports = new CommentController();

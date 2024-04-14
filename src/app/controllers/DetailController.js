const Detail = require('../models/Detail');
const status = require('http-status-codes');

class DetailController {
  async index(req, res, next) {
    try {
      const { id } = req.params;
      if (id) {
        const orders = await Detail.find({ orderID: id }).populate({
          path: 'productID',
        });
        if (orders) {
          return res.status(status.StatusCodes.OK).json({
            success: true,
            results: orders.length,
            orders,
          });
        } else {
          return res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Không có đơn hàng nào được tìm thấy.',
          });
        }
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin đơn hàng.',
      });
    }
  }
  async statistical(req, res, next) {
    try {
      const details = await Detail.find().populate({
        path: 'orderID',
        match: { status: 3 },
      });
      const orders = details.filter((detail) => detail.orderID !== null);
      if (orders) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: orders.length,
          orders,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có đơn hàng nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin đơn hàng.',
      });
    }
  }
  async add(req, res, next) {
    try {
      const { ...data } = req.body;
      if (data) {
        const order = await Detail.create(req.body);
        return res.status(status.StatusCodes.CREATED).json({
          success: true,
          data: order,
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
        message: 'Đã xảy ra lỗi khi lưu thông tin chi tiết đơn hàng.',
      });
    }
  }
}
module.exports = new DetailController();

const Order = require('../models/Order');
const Detail = require('../models/Detail');
const status = require('http-status-codes');
const transporter = require('../../middlewares/mailer');
const fs = require('fs');
const util = require('util');
const { renderInvoice } = require('../../utils');

const readFile = util.promisify(fs.readFile);

async function waitForFile(filePath) {
  return new Promise((resolve) => {
    const checkExistence = async () => {
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        resolve();
      } catch (error) {
        setTimeout(checkExistence, 1000);
      }
    };
    checkExistence();
  });
}

class OrderController {
  async index(req, res, next) {
    try {
      const orders = await Order.find({}).sort('-createdAt');
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
  async statistical(req, res, next) {
    try {
      const orders = await Order.find({ status: 3 });
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
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById({ _id: id });
      if (order) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          order,
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
  async invoice(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById({ _id: id });
      const orderDetail = await Detail.find({ orderID: id }).populate(
        'productID',
      );
      if (order) {
        const filePath = await renderInvoice(order, orderDetail);
        await waitForFile(filePath);
        const pdfContent = await readFile(filePath);
        transporter.sendMail({
          from: 'Ismart admin',
          to: order.email,
          subject: 'Đơn hành thanh toán tại iSmart ✔',
          text: 'Đơn hành thanh toán tại iSmart',
          attachments: [
            {
              filename: 'invoice.pdf',
              content: pdfContent,
            },
          ],
        });
        res.status(status.StatusCodes.OK).json({
          success: true,
          data: {
            message: 'Send bill successfully!',
            messageId: info.messageId,
          },
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
        const order = await Order.create(req.body);
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
        message: 'Đã xảy ra lỗi khi lưu thông tin đơn hàng.',
      });
    }
  }
  async update(req, res, next) {
    try {
      const { id, status: STATUS, cancelCount } = req.body;
      if (id) {
        if (status !== 1 && cancelCount) {
          const order = await Order.findOneAndUpdate(
            { _id: id },
            { status: STATUS, cancelCount: 1 },
            { new: true },
          );
          return res.status(status.StatusCodes.CREATED).json({
            success: true,
            order,
          });
        } else if (status !== 1 && !cancelCount) {
          const order = await Order.findOneAndUpdate(
            { _id: id },
            { status: STATUS },
            { new: true },
          );
          return res.status(status.StatusCodes.CREATED).json({
            success: true,
            order,
          });
        } else {
          return res.status(status.StatusCodes.OK).json({
            success: true,
            message: 'Cập nhật thành công.',
          });
        }
      } else {
        return res.status(status.StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu thông tin.',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật thông tin đơn hàng.',
      });
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (id) {
        await Order.deleteOne({ _id: id });
        return res.status(status.StatusCodes.OK).json({
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
        message: 'Đã xảy ra lỗi khi xoá thông tin đơn hàng.',
      });
    }
  }
}
module.exports = new OrderController();

const Catalog = require('../models/Catalog');
const status = require('http-status-codes');

class CatalogController {
  async index(req, res, next) {
    try {
      const catalogs = await Catalog.find({});
      if (catalogs) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: catalogs.length,
          catalogs,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có danh mục nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin danh mục.',
      });
    }
  }
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const catalog = await Catalog.findOne({ _id: id });
      if (catalog) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          catalog,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có danh mục nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin danh mục.',
      });
    }
  }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const catalog = await Catalog.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      if (catalog) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          catalog,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có danh mục nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin danh mục.',
      });
    }
  }
  async add(req, res, next) {
    try {
      const catalog = await Catalog.create(req.body);
      if (catalog) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          catalog,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có danh mục nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi tạo danh mục.',
      });
    }
  }
}

module.exports = new CatalogController();

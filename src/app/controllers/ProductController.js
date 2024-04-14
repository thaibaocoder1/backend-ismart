const Catalog = require('../models/Catalog');
const Product = require('../models/Product');
const Detail = require('../models/Detail');
const status = require('http-status-codes');
const fs = require('fs');
const util = require('util');
const { renderCSV } = require('../../utils');

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

class ProductController {
  // [GET] /products
  async index(req, res, next) {
    try {
      const products = await Product.find({}).sort('-updatedAt');
      const productsSold = await Detail.find({}).populate('orderID');
      res.status(status.StatusCodes.OK).json({
        success: true,
        results: products.length,
        productsSold,
        products,
      });
    } catch (error) {
      res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error from server!',
      });
    }
  }
  // [GET] /products/params
  async params(req, res, next) {
    const slug = req.query.slug;
    const page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    const allProducts = await Product.find({});
    const brand = req.query.brand;
    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    try {
      if (slug) {
        const category = await Catalog.findOne({ slug });
        const skip = (page - 1) * limit;
        const products = await Product.find({ categoryID: category._id })
          .sort('-updatedAt')
          .skip(skip)
          .limit(limit);
        const totalProducts = await Product.countDocuments({
          categoryID: category._id,
        });
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: products.length,
          allProducts,
          products,
          pagination: {
            limit,
            currentPage: page,
            totalRows: totalProducts,
          },
        });
      } else {
        if (brand && brand !== '' && minPrice && maxPrice) {
          const brands = brand.split(',');
          const brandRegexArray = brands.map((brand) => new RegExp(brand, 'i'));
          const brandQuery = {
            $or: brandRegexArray.map((brandRegex) => ({
              name: { $regex: brandRegex },
            })),
          };
          const priceQuery = {
            $gte: parseInt(minPrice),
            $lte: parseInt(maxPrice),
          };
          const mainQuery = {
            $and: [brandQuery, { price: priceQuery }],
          };
          limit = 8;
          const skip = (page - 1) * limit;
          const products = await Product.find(mainQuery)
            .sort('-updatedAt')
            .skip(skip)
            .limit(limit);
          const totalProducts = await Product.countDocuments(mainQuery);
          if (products && products.length > 0) {
            return res.status(status.StatusCodes.OK).json({
              success: true,
              results: products.length,
              allProducts,
              products,
              pagination: {
                limit,
                currentPage: page,
                totalRows: totalProducts,
              },
            });
          }
        } else {
          if (brand && brand !== '' && minPrice === 1) {
            const brands = brand.split(',');
            const brandRegexArray = brands.map(
              (brand) => new RegExp(brand, 'i'),
            );
            const brandQuery = {
              $or: brandRegexArray.map((brandRegex) => ({
                name: { $regex: brandRegex },
              })),
            };
            const priceQuery = {
              $gte: parseInt(minPrice),
            };
            const mainQuery = {
              $and: [brandQuery, { price: priceQuery }],
            };
            limit = 8;
            const skip = (page - 1) * limit;
            const products = await Product.find(mainQuery)
              .sort('-updatedAt')
              .skip(skip)
              .limit(limit);
            const totalProducts = await Product.countDocuments(mainQuery);
            if (products && products.length > 0) {
              return res.status(status.StatusCodes.OK).json({
                success: true,
                results: products.length,
                allProducts,
                products,
                pagination: {
                  limit,
                  currentPage: page,
                  totalRows: totalProducts,
                },
              });
            }
          } else {
            const skip = (page - 1) * limit;
            const products = await Product.find({})
              .sort('-updatedAt')
              .skip(skip)
              .limit(limit);
            const totalProducts = await Product.countDocuments();
            if (products && products.length > 0) {
              return res.status(status.StatusCodes.OK).json({
                success: true,
                results: products.length,
                allProducts,
                products,
                pagination: {
                  limit,
                  currentPage: page,
                  totalRows: totalProducts,
                },
              });
            } else {
              return res.status(status.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Không có sản phẩm nào được tìm thấy.',
              });
            }
          }
        }
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.',
      });
    }
  }
  // [GET] /products/params
  async export(req, res, next) {
    const products = await Product.find(
      {},
      { _id: 1, code: 1, name: 1, quantity: 1 },
    );
    const details = await Detail.find().populate({
      path: 'orderID',
      match: { status: 3 },
    });
    const orders = details.filter((detail) => detail.orderID !== null);
    products.forEach((item) => {
      const productSold = orders.find(
        (x) =>
          x.orderID.status === 3 &&
          x.productID.toString() === item._id.toString(),
      );
      if (item._id.toString() === productSold?.productID.toString()) {
        item.sold = productSold.quantity;
      }
    });
    const filteredData = products.map((item) => {
      return {
        _id: item._id.toString(),
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        sold: item?.sold || 0,
      };
    });
    const data = await renderCSV(filteredData);
    await waitForFile(data.filePath);
    const csvContent = await readFile(data.filePath);
    if (csvContent) {
      res.status(status.StatusCodes.OK).json({
        success: true,
        message: 'Export successfully',
        link: `http://localhost:3001/csv/${data.fileName}`,
      });
    } else {
      res.status(status.StatusCodes.OK).json({
        success: false,
        message: 'Export failed',
      });
    }
  }
  // [GET] /products/:id
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ _id: id }).populate('categoryID');
      if (product) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          product,
        });
      } else {
        return res.status(status.StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Không có sản phẩm nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  // [GET] /products/:slug
  async slug(req, res, next) {
    try {
      const { slug } = req.params;
      const catalog = await Catalog.findOne({ slug });
      const products = await Product.find({ categoryID: catalog?._id });
      const productSolds = await Detail.find({}).populate('productID');
      if (products && products.length > 0) {
        return res.status(status.StatusCodes.OK).json({
          success: true,
          results: products.length,
          products,
          productSolds,
        });
      } else {
        return res.status(status.StatusCodes.OK).json({
          success: false,
          message: 'Không có sản phẩm nào được tìm thấy.',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  // [POST] /products/add
  async add(req, res, next) {
    try {
      req.body.thumb = {
        data: Buffer.from(
          `http://localhost:3001/uploads/${req.file.originalname}`,
        ),
        contentType: req.file.mimetype,
        fileName: `http://localhost:3001/uploads/${req.file.originalname}`,
      };
      const productExist = await Product.findOne({ code: req.body.code });
      if (productExist) {
        return res.status(status.StatusCodes.CONFLICT).json({
          success: false,
          message: 'Sản phẩm bị trùng mã code',
        });
      } else {
        const product = await Product.create(req.body);
        if (product) {
          return res.status(status.StatusCodes.CREATED).json({
            success: true,
            product,
          });
        } else {
          return res.status(status.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Không có sản phẩm nào được tìm thấy.',
          });
        }
      }
    } catch (error) {
      console.log(error);

      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  // [POST] /products/update/:id
  async update(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!req.file) {
        if (JSON.stringify(req.body) !== JSON.stringify(product.toObject())) {
          await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
          });
        }
      } else {
        req.body.thumb = {
          data: `http://localhost:3001/uploads/${req.file.originalname}`,
          contentType: req.file.mimetype,
          fileName: `http://localhost:3001/uploads/${req.file.originalname}`,
        };
        await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
        });
      }
      res.status(status.StatusCodes.OK).json({
        success: true,
        message: 'Update successfully',
      });
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
  async updateOrder(req, res, next) {
    try {
      const product = await Product.findById(req.body.id);
      if (product) {
        await Product.findByIdAndUpdate({ _id: req.body.id }, req.body);
        res.status(status.StatusCodes.CREATED).json({
          success: true,
          message: 'Update successfully',
        });
      }
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm.',
      });
    }
  }
}
module.exports = new ProductController();

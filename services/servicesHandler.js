const asyncHandler = require("express-async-handler");
const prisma = require("../config/prisma-db");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcrypt");
const { calculateNetSalary } = require("../utils/netSalaryCalculation");

// @desc      Create Record Handler
exports.createOne = (model) =>
  asyncHandler(async (req, res, next) => {
    let data = req.body;
    // if user model sanitize body to exclude passwordConfirm
    if (model === "user") {
      req.sanitizedData.password = await bcrypt.hash(
        req.sanitizedData.password,
        12
      );
      data = req.sanitizedData;
    }

    const newRecord = await prisma[model].create({
      data,
    });

    if (!newRecord) {
      return next(new ApiError("There is problem in creating record", 500));
    }

    res.status(201).json({ data: newRecord });
  });

// @desc      Get All Records Handler
exports.getAll = (model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const {
      defaultWhere = {},
      defaultInclude = {},
      ownerField = "userId",
      sort = { field: "createdAt", order: "desc" },
    } = options;

    // pagination options
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // build default where
    const where = { ...defaultWhere };

    // check record ownership
    if (req.params[ownerField]) {
      where[ownerField] = req.params[ownerField];
    }

    // check shares parent
    let parentType = "";
    if (req.params.fellowId) {
      parentType = "fellowId";
      where[parentType] = req.params.fellowId;
    } else if (req.params.itemId) {
      parentType = "itemId";
      where[parentType] = req.params.itemId;
    }

    // Apply search filter
    if (req.query.search) {
      where.OR = [
        // { amount: { contains: req.query.search, mode: "insensitive" } },
      ];
    }

    // get all record data
    const [records, allRecordCount] = await Promise.all([
      prisma[model].findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort.field]: sort.order },
        include: defaultInclude,
      }),
      // get all records count
      prisma[model].count({ where }),
    ]);

    if (records.length === 0) {
      return next(new ApiError(`There is no records found`, 404));
    }

    // calculate netSalary if model = user
    if (model === "user") {
      records.map((record) => {
        record.netSalary = calculateNetSalary(record) || 0;
      });
    }

    // pagination result
    const pagination = {};

    pagination.totalItems = allRecordCount || 0;
    pagination.currentPage = page;
    pagination.itemsPerPage = limit;
    pagination.totalPages = Math.ceil(allRecordCount / limit);
    pagination.prevPage = skip > 0 ? page - 1 : null;
    pagination.nextPage = endIndex < allRecordCount ? page + 1 : null;

    res
      .status(200)
      .json({ results: pagination.totalItems, pagination, data: records });
  });

// @desc      Get Record Handler
exports.getOne = (model, options) =>
  asyncHandler(async (req, res, next) => {
    const record = await prisma[model].findUnique({
      where: { id: req.params.id },
      include: options.include,
    });

    if (!record) {
      return next(new ApiError("Record not found", 404));
    }
    // calculate netSalary if model = user
    if (model === "user") {
      record.netSalary = calculateNetSalary(record) || 0;
    }

    res.status(200).json({ data: record });
  });

// @desc      Update Record Handler
exports.updateOne = (model, options) =>
  asyncHandler(async (req, res, next) => {
    // filter fields to update
    let data = {};
    const allowedFields = options.allowedFields || Object.keys(req.body);

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });
    // execute update
    const updatedRecord = await prisma[model].update({
      where: { id: req.params.id },
      data,
      include: options.include,
    });

    if (!updatedRecord) {
      return next(
        new ApiError(`There is no Record for this id: ${req.params.id}`, 404)
      );
    }

    res.status(201).json({ data: updatedRecord });
  });

// @desc      Delete Record Handler
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const deletedRecord = await prisma[model].delete({
      where: { id: req.params.id },
    });

    if (!deletedRecord) {
      return next(
        new ApiError(`There is no Record for this id: ${req.params.id}`, 404)
      );
    }

    res.status(204).send();
  });

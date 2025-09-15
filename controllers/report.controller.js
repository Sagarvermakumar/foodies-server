import moment from "moment";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ErrorHandler from "../Middleware/Error.js";
import Item from "../Models/Item.model.js";
import Order from "../Models/Order.model.js";
import User from "../Models/User.model.js";
import { Parser } from "json2csv";

/**
 * @desc    Get sales report (daily or weekly)
 * @route   GET /api/v1/reports/sales?range=day|week
 * @access  MANAGER / SUPER_ADMIN
 * @use     This endpoint returns sales summary for the given range
 * @query   range - "day" or "week"
 */



export const getSalesReport = catchAsyncError(async (req, res,next) => {
  const { range="day" } = req.query;

  // validate range
  if (!["day", "week"].includes(range)) {
    return next(new ErrorHandler("Invalid range. Use 'day' or 'week'.",400))
  }

  let matchStage = {
    status: "completed",
  };

  if (range === "day") {
    // today start & end
    const start = moment().startOf("day").toDate();
    const end = moment().endOf("day").toDate();

    matchStage.createdAt = { $gte: start, $lte: end };
  } else if (range === "week") {
    // current week start & end
    const start = moment().startOf("isoWeek").toDate();
    const end = moment().endOf("isoWeek").toDate();

    matchStage.createdAt = { $gte: start, $lte: end };
  }

  const report = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);

  const data =
    report.length > 0
      ? {
          ...(range === "day"
            ? { date: moment().format("YYYY-MM-DD") }
            : { week: moment().format("GGGG-[W]WW") }),
          totalOrders: report[0].totalOrders,
          totalSales: report[0].totalSales,
        }
      : {
          ...(range === "day"
            ? { date: moment().format("YYYY-MM-DD") }
            : { week: moment().format("GGGG-[W]WW") }),
          totalOrders: 0,
          totalSales: 0,
        };

  res.status(200).json({
    success: true,
    message: `Sales report (${range}) fetched successfully`,
    data,
  });
});

/**
 * @desc    Get top selling items
 * @route   GET /api/v1/reports/top-items
 * @access  MANAGER / SUPER_ADMIN
 * @use     This endpoint returns top 5 selling items
 */

export const getTopItemsReport = catchAsyncError(async (req, res) => {
  const { limit = 5 } = req.query; // default 5 top items

  // Aggregation pipeline
  const report = await Order.aggregate([
    { $unwind: "$items" }, // har order ke item ko alag row
    {
      $group: {
        _id: "$items.name", // ya "$items.itemId" use kar sakte ho
        sold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { sold: -1 } }, // zyada bechne wale top
    { $limit: parseInt(limit) },
    {
      $project: {
        _id: 0,
        item: "$_id",
        sold: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Top items report fetched successfully",
    data: report,
  });
});

/**
 * @desc    Get customer report
 * @route   GET /api/v1/reports/customers
 * @access  MANAGER / SUPER_ADMIN
 * @use     This endpoint returns customer engagement & order data
 */
export const getCustomerReport = catchAsyncError(async (req, res) => {

    const {xDaysAgo = 30}= req.query;
    // Total customers who placed at least 1 order
    const totalCustomers = (await Order.distinct("customer")).length;

    // Active customers (last 30 days)
    xDaysAgo.setDate(xDaysAgo.getDate() - xDaysAgo);

    const activeCustomers = await Order.distinct("customer", {
      createdAt: { $gte: xDaysAgo },
    }).then((data) => data.length);

    // Repeat customers (placed more than 1 order)
    const repeatCustomersAgg = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      { $count: "repeatCount" },
    ]);

    const repeatCustomers =
      repeatCustomersAgg.length > 0 ? repeatCustomersAgg[0].repeatCount : 0;

    res.status(200).json({
      success: true,
      message: "Customer report fetched successfully",
      data: {
        totalCustomers,
        activeCustomers,
        repeatCustomers,
      },
    });

});

/**
 * @desc    Get delivery performance report
 * @route   GET /api/v1/reports/delivery-performance
 * @access  MANAGER / SUPER_ADMIN
 * @use     This endpoint shows average delivery times & success rates
 */
export const getDeliveryPerformanceReport = catchAsyncError(async (req, res) => {
    // Total delivered orders count
    const totalDelivered = await Order.countDocuments({ status: "delivered" });

    // Agar koi order hi nahi deliver hua
    if (totalDelivered === 0) {
      return res.status(200).json({
        success: true,
        message: "No delivered orders found",
        data: {
          avgDeliveryTime: "0 min",
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          deliverySuccessRate: "0%",
        },
      });
    }

    // Sare delivered orders fetch karo with timestamps
    const deliveredOrders = await Order.find(
      { status: "delivered" },
      "placedAt deliveredAt"
    );

    let totalDeliveryTime = 0;
    let onTime = 0;
    let late = 0;

    deliveredOrders.forEach((order) => {
      const deliveryTimeMinutes =
        (new Date(order.deliveredAt) - new Date(order.placedAt)) / (1000 * 60);

      totalDeliveryTime += deliveryTimeMinutes;

      // Example threshold: 30 min se kam = on-time
      if (deliveryTimeMinutes <= 30) {
        onTime++;
      } else {
        late++;
      }
    });

    const avgDeliveryTime = (
      totalDeliveryTime / deliveredOrders.length
    ).toFixed(1);
    const deliverySuccessRate =
      ((onTime / deliveredOrders.length) * 100).toFixed(1) + "%";

    const report = {
      avgDeliveryTime: `${avgDeliveryTime} min`,
      onTimeDeliveries: onTime,
      lateDeliveries: late,
      deliverySuccessRate,
    };

    res.status(200).json({
      success: true,
      message: "Delivery performance report fetched successfully",
      data: report,
    });
  }
);

/**
 * @desc    Export report in CSV
 * @route   GET /api/v1/reports/export.csv
 * @access  MANAGER / SUPER_ADMIN
 * @use     This endpoint exports sales report in CSV format
 */
export const exportReportCSV = catchAsyncError(async (req, res) => {
  
    // Example: group by items sold
    const salesData = await Order.aggregate([
      { $unwind: "$items" }, // items array ko flatten karna
      {
        $group: {
          _id: "$items.name", // item ke naam ke hisab se group
          sold: { $sum: "$items.quantity" }, // total quantity
        },
      },
      { $project: { item: "$_id", sold: 1, _id: 0 } }, // final shape
    ]);

    // CSV fields
    const fields = ["item", "sold"];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(salesData);

    // Response as CSV
    res.header("Content-Type", "text/csv");
    res.attachment("sales_report.csv");
    return res.send(csvData);
});



export const getAllStats = catchAsyncError(async (req, res, next) => {
  const users = await User.countDocuments();
  const orders = await Order.countDocuments();
  const item = await Item.countDocuments();

  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const orderGrowth = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const itemGrowth = await Item.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  // Check if any stats are missing
  if (!userGrowth || userGrowth.length === 0) {
    return next(new ErrorHandler("No user growth data found", 404));
  }
  if (!orderGrowth || orderGrowth.length === 0) {
    return next(new ErrorHandler("No order growth data found", 404));
  }

  if (!itemGrowth || itemGrowth.length === 0) {
    return next(new ErrorHandler("No menu growth data found", 404));
  }

  if (!users && !orders && !item) {
    return next(new ErrorHandler("No stats found", 404));
  }

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
  const currentYear = currentDate.getFullYear();
  const currentMonthData = userGrowth.find((item) => item._id === currentMonth);
  if (!currentMonthData) {
    userGrowth.push({ _id: currentMonth, count: 0 });
  }
  userGrowth.sort((a, b) => new Date(a._id) - new Date(b._id));
  orderGrowth.sort((a, b) => new Date(a._id) - new Date(b._id));
  itemGrowth.sort((a, b) => new Date(a._id) - new Date(b._id));

  res.status(200).json({
    success: true,
    message: "Stats Fetched Successfully",
    data: {
      users,
      orders,
      item,
      userGrowth: userGrowth.map((item) => ({
        month: item._id,
        count: item.count,
      })),
      orderGrowth: orderGrowth.map((item) => ({
        month: item._id,
        count: item.count,
      })),

      itemGrowth: itemGrowth.map((item) => ({
        month: item._id,
        count: item.count,
      })),
      currentMonth: {
        month: currentMonth,
        users: currentMonthData ? currentMonthData.count : 0,
      },
      currentYear: {
        year: currentYear,
        users: userGrowth
          .filter((item) => item._id.startsWith(currentYear))
          .reduce((acc, item) => acc + item.count, 0),
      },
      currentMonthOrders:
        orderGrowth.find((item) => item._id === currentMonth)?.count || 0,
      currentYearOrders: orderGrowth
        .filter((item) => item._id.startsWith(currentYear))
        .reduce((acc, item) => acc + item.count, 0),
      currentMonthitem:
        itemGrowth.find((item) => item._id === currentMonth)?.count || 0,
      currentYearitem: itemGrowth
        .filter((item) => item._id.startsWith(currentYear))
        .reduce((acc, item) => acc + item.count, 0),
    },
  });
});

// get order stats
export const getOrderStats = catchAsyncError(async (req, res, next) => {
  const { lastXDays = 30 } = req.query;
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        totalPrice: 1,
      },
    },
  ]);

  if (!stats || stats.length === 0) {
    return next(new ErrorHandler("No order statistics found", 404));
  }

  // Sort stats by status for better readability
  const ORDER_STATUS = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "PICKED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "COMPLETE",
  ];
  stats.sort(
    (a, b) => ORDER_STATUS.indexOf(a.status) - ORDER_STATUS.indexOf(b.status)
  );

  // Format the stats to include total count and total price
  const formattedStats = stats.map((stat) => ({
    status: stat.status,
    count: stat.count,
    totalPrice: stat.totalPrice,
  }));

  //get last X days stats
  const lastXDaysStats = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - lastXDays * 24 * 60 * 60 * 1000), // Last X days
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        totalPrice: 1,
      },
    },
  ]);



  // Sort last X days stats by status for better readability
  lastXDaysStats.sort(
    (a, b) => ORDER_STATUS.indexOf(a.status) - ORDER_STATUS.indexOf(b.status)
  );


  // last 180 days stats

  res.status(200).json({
    success: true,
    message: "Order statistics fetched successfully",
    data: formattedStats,
  });
});

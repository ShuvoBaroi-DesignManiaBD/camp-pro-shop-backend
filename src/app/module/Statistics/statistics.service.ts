/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from 'mongoose';
import Order from '../Order/order.model';
import Product from '../Product/product.model';
import { User } from '../User/user.model';

export const statisticsForAdmin = async () => {
    const statistics = await Order.aggregate([
        {
            // Match only completed orders
            $match: {
                status: 'paid'
            }
        },
        {
            // Calculate total revenue
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' }, // Assuming totalPrice is the field for the order's total cost
            }
        }
    ]);

    // Revenue for the last 30 days
    const revenueLast30Days = await Order.aggregate([
        {
            $match: {
                status: 'paid',
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Get orders for last 30 days
                }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: '$createdAt' },
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                dailyRevenue: { $sum: '$totalPrice' } // Sum total price per day
            }
        },
        {
            // Sort by date
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
                '_id.day': 1
            }
        }
    ]);

    // Get the count of products, users, and orders
    const productCount = await Product.countDocuments({isDeleted:false});
    const userCount = await User.countDocuments({isDeleted:false});
    const orderCount = await Order.countDocuments();

    // Return the full statistics object
    return {
        productCount,
        userCount,
        orderCount,
        totalRevenue: statistics[0]?.totalRevenue || 0,
        dailyRevenue: revenueLast30Days
    };
};

export const StatisticsServices = {
  statisticsForAdmin,
}
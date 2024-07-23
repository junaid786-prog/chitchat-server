const { Customer } = require('../models/customer.model');
const { Booking } = require('../models/booking.model');
const { Invoice } = require('../models/invoice.model');
const { CatchAsync } = require('../utils/CatchAsync');
const { MyBooking } = require('../models/myBooking.model');
const { Payment } = require('../models/payment.model');
const { default: mongoose } = require('mongoose');

const AdminController = {
    getAnalytics: CatchAsync(async (req, res) => {
        // Total number of customers
        /**
         * {
         *   total: "",
         *   airbnb: "",
         * }
         */
        const totalCustomers = await Customer.aggregate([
            {
                $match: { vendor: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $facet: {
                    total: [{ $count: "total" }],
                    airbnb: [{ $match: { isAirbnbHost: true } }, { $count: "isAirbnbHost" }],
                }
            }
        ]);

        // Total number of bookings
        /**
         * {
         *   total: "",
         *   scheduled: "",
         *   completed: "",
         *   active: ""
         * }
         */
        const totalBookingsResult = await Booking.aggregate([
            {
                $match: { vendor: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $facet: {
                    total: [{ $count: "total" }],
                    scheduled: [{ $match: { status: "Scheduled" } }, { $count: "scheduled" }],
                    completed: [{ $match: { status: "Completed" } }, { $count: "completed" }],
                    active: [{ $match: { status: "Active" } }, { $count: "active" }]
                }
            }
        ]);

        // revenu 
        /**
         * {
         *   total: ,
         *   unpaid: '',
         *   paid: ''
         * }
         */

        const revenue = await Invoice.aggregate([
            {
                $match: { vendor: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $facet: {
                    total: [{ $group: { _id: null, totalRevenue: { $sum: "$amount" } } }],
                    unpaid: [{ $match: { status: "Pending" } }, { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }],
                    paid: [{ $match: { status: "Paid" } }, { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }]
                }
            }
        ]);



        // subscriptions
        /**
         * {
         *  total: "",
         *  active: "",
         *  cancelled: "",
         *  pending: ""
         * }
         */
        // isRecurring: true
        const subscriptions = await MyBooking.aggregate([
            {
                $match: { isRecurring: true, vendor: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $facet: {
                    total: [{ $count: "total" }],
                    active: [{ $match: { status: "Active" } }, { $count: "active" }],
                    cancelled: [{ $match: { status: "Cancelled" } }, { $count: "cancelled" }],
                    pending: [{ $match: { status: "Scheduled" } }, { $count: "pending" }]
                }
            }
        ]);

        // payments whose type is `Subscription`
        const subscriptionsRevenue = await Payment.aggregate([
            {
                $match: { type: "Subscription", vendor: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $facet: {
                    total: [{ $count: "total" }],
                    active: [{ $match: { status: "active" } }, { $count: "active" }],
                    cancelled: [{ $match: { status: "cancelled" } }, { $count: "cancelled" }],
                    pending: [{ $match: { status: "pending" } }, { $count: "pending" }]
                }
            }
        ]);

        // Additional metrics can be added here

        res.status(200).json({
            status: "success",
            data: {
                customers: {
                    total: totalCustomers[0].total[0] ? totalCustomers[0].total[0].total : 0,
                    airbnb: totalCustomers[0].airbnb[0] ? totalCustomers[0].airbnb[0].isAirbnbHost : 0
                },
                bookings: {
                    total: totalBookingsResult[0].total[0] ? totalBookingsResult[0].total[0].total : 0,
                    scheduled: totalBookingsResult[0].scheduled[0] ? totalBookingsResult[0].scheduled[0].scheduled : 0,
                    completed: totalBookingsResult[0].completed[0] ? totalBookingsResult[0].completed[0].completed : 0,
                    active: totalBookingsResult[0].active[0] ? totalBookingsResult[0].active[0].active : 0
                },
                revenue: {
                    total: revenue[0].total[0] ? revenue[0].total[0].totalRevenue : 0,
                    unpaid: revenue[0].unpaid[0] ? revenue[0].unpaid[0].totalRevenue : 0,
                    paid: revenue[0].paid[0] ? revenue[0].paid[0].totalRevenue : 0
                },
                subscriptions: {
                    total: subscriptions[0].total[0] ? subscriptions[0].total[0].total : 0,
                    active: subscriptions[0].active[0] ? subscriptions[0].active[0].active : 0,
                    cancelled: subscriptions[0].cancelled[0] ? subscriptions[0].cancelled[0].cancelled : 0,
                    pending: subscriptions[0].pending[0] ? subscriptions[0].pending[0].pending : 0
                },
                subscriptionsRevenue: {
                    total: subscriptionsRevenue[0].total[0] ? subscriptionsRevenue[0].total[0].total : 0,
                    active: subscriptionsRevenue[0].active[0] ? subscriptionsRevenue[0].active[0].active : 0,
                    cancelled: subscriptionsRevenue[0].cancelled[0] ? subscriptionsRevenue[0].cancelled[0].cancelled : 0,
                    pending: subscriptionsRevenue[0].pending[0] ? subscriptionsRevenue[0].pending[0].pending : 0
                }

            }
        });
    })
};

module.exports = AdminController;

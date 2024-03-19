import mongoose from "mongoose";
import { Floor } from "../models/floor.model.js";

const createBooking = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const { floorId, slotId, userId } = req.params;

        //sanitising empty fields
        const isEmptyFields = [
            date,
            startTime,
            endTime,
        ].some((field) => field?.trim() === "");

        if (isEmptyFields) {
            return res.status(400).json("All fields are required for booking");
        }

        const floor = await Floor.findById(floorId);
        if (!floor) {
            return res.status(404).json("Floor not found");
        }

        const slot = floor.slots.find((slot) => slot?._id.toString() === slotId);
        if (!slot) {
            return res.status(404).json("Slot not found");
        }

        const duration = slot.calculateDuration(startTime, endTime);

        // saving startTime, endTime and isParked status in nested slot in floor.
        slot.isReserved = true;
        slot.userId = userId;
        slot.startTime = startTime;
        slot.endTime = endTime;
        slot.date = date;
        slot.duration = duration;

        await floor.save();

        const data = await Floor.find();
        return res.status(200).json({ message: "Slot Booked Succesfully", data });
    } catch (err) {
        console.log('Error...', err)
        res.status(500).json({ message: "Server Error" });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { floorId, slotId } = req.params;

        // is floor and slot available or not
        const floor = await Floor.findById(floorId);
        if (!floor) {
            return res.status(404).json("Floor not found");
        }

        const slot = floor.slots.find((slot) => slot?._id.toString() === slotId);
        if (!slot) {
            return res.status(404).json("Slot not found");
        }

        slot.isReserved = false;
        slot.startTime = null;
        slot.endTime = null;
        slot.userId = null;

        await floor.save();
        return res.status(200).json({ message: "Booking cancel succesfully" });
    }
    catch (err) {
        console.log('ERROR', err)
        res.send(500).json({ message: 'Server Error', error: err });
    }
}

const extendBooking = async (req, res) => {
    try {
        const { date, endTime } = req.body;
        const { floorId, slotId } = req.params;

        //sanitising empty fields
        const isEmptyFields = [
            date, endTime
        ].some((field) => field?.trim() === "");

        if (isEmptyFields) {
            return res.status(400).json("All fields are required for booking");
        }

        const floor = await Floor.findById(floorId);
        if (!floor) {
            return res.status(404).json("Floor not found");
        }

        const slot = floor.slots.find((slot) => slot?._id.toString() === slotId);
        if (!slot) {
            return res.status(404).json("Slot not found");
        }

        // saving startTime, endTime and isParked status in nested slot in floor.
        slot.date = date;
        slot.endTime = endTime;

        await floor.save();

        const data = await Floor.find();
        return res.status(200).json({ message: "Slot duration extended succesfully", data });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
}

const updateBooking = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const { floorId, slotId } = req.params;

        //sanitising empty fields
        const isEmptyFields = [
            date,
            startTime,
            endTime,
        ].some((field) => field?.trim() === "");

        if (isEmptyFields) {
            return res.status(400).json("All fields are required for booking");
        }

        const floor = await Floor.findById(floorId);
        if (!floor) {
            return res.status(404).json("Floor not found");
        }

        const slot = floor.slots.find((slot) => slot?._id.toString() === slotId);
        if (!slot) {
            return res.status(404).json("Slot not found");
        }

        // saving startTime, endTime and isParked status in nested slot in floor.
        slot.isParked = true;
        slot.startTime = startTime;
        slot.endTime = endTime;

        await floor.save();

        const data = await Floor.find();
        return res.status(200).json({ message: "Slot details updated succesfully", data });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getAllBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const mongooseifyedUserId = new mongoose.Types.ObjectId(userId);

        const bookings = await Floor.aggregate([
            {
                $unwind: '$slots'
            },
            {
                $match: {
                    'slots.userId': mongooseifyedUserId
                }
            },
            {
                $project: {
                    floorId: '$_id',
                    slotId: '$slots._id',
                    floorNumber: '$floorNumber',
                    slotNumber: '$slots.slotNumber',
                    date: '$slots.date',
                    startTime: '$slots.startTime',
                    isReserved: '$slots.isReserved',
                    endTime: '$slots.endTime'
                }
            }
        ]);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({ message: 'No bookings for this user', data: [] });
        }

        res.status(200).json({ message: 'Booking found', data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllUsersBooking = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    try {
        const pipeline = [
            {
                $unwind: '$slots'
            },
            {
                $match: {
                    $and: [
                        { 'slots.userId': { $exists: true } }, // Ensure slots.userId exists
                        { 'slots.userId': { $ne: null } }, // Filter out null userId
                        { 'slots.userId': { $ne: '' } } // Filter out empty string userId
                    ]
                }
            },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'slots.userId',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        {
                            $project: {
                                floorId: '$_id',
                                slotId: '$slots._id',
                                floorNumber: '$floorNumber',
                                slotNumber: '$slots.slotNumber',
                                date: '$slots.date',
                                startTime: '$slots.startTime',
                                endTime: '$slots.endTime',
                                duration: '$slots.duration',
                                fullName: '$user.fullname',
                                email: '$user.email'
                            }
                        }
                    ],

                    totalCount: [
                        { $group: { _id: null, total: { $sum: 1 } } }
                    ]
                }
            }
        ];

        const [{ data, totalCount }] = await Floor.aggregate(pipeline);

        const hasMore = (page * limit) <= totalCount[0]?.total;

        if (!data || data.length === 0) {
            return res.status(200).json({ message: 'No bookings found', data: [] });
        }

        res.status(200).json({ message: 'Bookings found', data, hasMore });
    } catch (err) {
        ;
        res.status(500).json({ message: 'Server Error' })
    }
}



export { createBooking, cancelBooking, extendBooking, updateBooking, getAllBookingsByUser, getAllUsersBooking };

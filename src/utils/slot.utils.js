import moment from 'moment';
import { Floor } from '../models/floor.model.js';

// Function to update slots based on the current time
const updateSlots = async () => {
    const currentTime = moment();

    try {
        const bookedSlots = await Floor.find({ 'slots.userId': { $exists: true } });

        for (const floor of bookedSlots) {
            for (const slot of floor.slots) {
                const endTime = moment(`${slot.date} ${slot.endTime}`, 'DD-MM-YYYY HH:mm:ss');

                if (currentTime.isAfter(endTime)) {
                    slot.userId = null;
                    slot.startTime = null;
                    slot.endTime = null;
                    slot.isReserved = false;
                    slot.date = null;
                    slot.duration = null;
                    const floorDetails = await floor.save();
                }
            }
        }

        const floors = await Floor.find()
        return floors;
    } catch (error) {
        console.error('Error updating slots:', error);
    }
};

const pushNotification = async (userId, res) => {
    const fiveMinutesFromNow = moment().add(5, 'minutes');
    const bookedSlots = await Floor.find({ 'slots.userId': userId });

    let notifications = []
    for (const floor of bookedSlots) {
        for (const slot of floor.slots) {
            // Create the end time for the booked slot
            const endTime = moment(`${slot.date} ${slot.endTime}`, 'DD-MM-YYYY HH:mm:ss');

            // Check if the end time is less than 5 minutes from now
            if (endTime.isBefore(fiveMinutesFromNow)) {
                const message = {
                    notification: 'Your booking is less than 5 minutes away!',
                    floorNumber: floor.floorNumber,
                    slotNumber: slot.slotNumber
                };
                // let parsedMessage = `data: ${JSON.stringify(message)}\n\n`;
                notifications?.push(message)
            }
        }
    }
    return notifications;
}

export { updateSlots, pushNotification };

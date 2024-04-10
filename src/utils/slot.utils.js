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
                    await floor.save();
                }
            }
        }
    } catch (error) {
        console.error('Error updating slots:', error);
    }
};

export { updateSlots };

import moment from 'moment';
import { Floor } from '../models/floor.model.js';

const pushNotification = async (userId, res) => {
    const fiveMinutesFromNow = moment().add(5, 'minutes');
    const bookedSlots = await Floor.find({ 'slots.userId': userId });

    for (const floor of bookedSlots) {
        for (const slot of floor.slots) {
            // Create the end time for the booked slot
            const endTime = moment(`${slot.date} ${slot.endTime}`, 'DD-MM-YYYY HH:mm:ss');

            // Check if the end time is less than 5 minutes from now
            if (endTime.isBefore(fiveMinutesFromNow)) {
                const message = {
                    notification: 'Your booking is less than 5 minutes away!',
                    floorNumber: floor.floorNumber,
                    slotDetails: slot
                };

                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        }
    }
}

const notifyEndTime = async (req, res) => {
    let clients = [];

    const { userId } = req.query;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientId = Date.now();
    res.flushHeaders();

    // res.write(`data: Welcome! Your client ID is: ${clientId}\n\n`);

    const intervalId = setInterval(() => {
        pushNotification(userId, res); // Call pushNotification at regular intervals
    }, 60000); // Adjust the interval as needed

    const client = { id: clientId, res };
    clients.push(client);

    req.on('close', () => {
        clearInterval(intervalId);
        clients = clients.filter(c => c.id !== clientId);
    });

    try {
        pushNotification(userId, res); // Call pushNotification immediately

    } catch (error) {
        console.error('Error fetching booked slots:', error);
        res.status(500).send('Internal Server Error');
    }
};

export { notifyEndTime };


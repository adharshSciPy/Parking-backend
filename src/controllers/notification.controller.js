import moment from 'moment';
import { Floor } from '../models/floor.model.js';

const notifiyEndTime = async (req, res) => {
    let clients = [];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientId = Date.now();
    res.flushHeaders();

    res.write(`data: Welcome! Your client ID is: ${clientId}\n\n`);

    const intervalId = setInterval(() => {
        res.write(':heartbeat\n\n');
    }, 10000);

    const client = { id: clientId, res };
    clients.push(client);

    req.on('close', () => {
        clearInterval(intervalId);
        clients = clients.filter(c => c.id !== clientId);
    });

    const fiveMinutesFromNow = moment().add(5, 'minutes');

    try {
        const bookedSlots = await Floor.find({ 'slots.userId': { $exists: true } });

        // Iterate through each booked slot
        for (const floor of bookedSlots) {
            for (const slot of floor.slots) {
                const endTime = moment(`${slot.date} ${slot.endTime}`, 'YYYY-MM-DD HH:mm:ss');

                if (endTime.isSameOrBefore(fiveMinutesFromNow)) {
                    const message = {
                        notification: 'Your booking is 5 minutes away!',
                        slotDetails: slot
                    };

                    res.write(`data: ${JSON.stringify(message)}\n\n`);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching booked slots:', error);
    }
};

export { notifiyEndTime };

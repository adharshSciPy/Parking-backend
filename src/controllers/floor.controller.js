import { Floor } from "../models/floor.model.js";

const createFloorAndSlot = async (req, res) => {
    try {
        const { floorArray } = req.body;
        const isEmptyFloor = !Array.isArray(floorArray) || floorArray.length === 0;

        // sanitizing inputs
        if (isEmptyFloor) {
            return res.status(400).json({ message: 'At least one floor and a slot are mandatory' });
        }

        for (const item of floorArray) {
            const newSlot = [];

            for (const slots of item.slots) {
                const slot = {
                    slotNumber: parseInt(slots.slotNumber)
                };
                newSlot.push(slot);
            }

            const newFloor = new Floor({
                floorNumber: item.floorNumber,
                slots: newSlot
            });

            await newFloor.save();
        }

        return res.status(200).json({ message: 'New Parking slot or floor created successfully' });
    }
    catch (err) {
        console.log('error:', err);
        return res.status(500).json({ message: 'Server Error', error: err });
    }
}

const updateFloorAndSlot = async (req, res) => {
    try {
        const { floorArray } = req.body;
        const isEmptyFloor = !Array.isArray(floorArray) || floorArray.length === 0;

        // Sanitizing inputs
        if (isEmptyFloor) {
            return res.status(400).json({ message: 'At least one floor and a slot are mandatory' });
        }

        for (const floor of floorArray) {
            const existingFloor = await Floor.findOne({ floorNumber: floor?.floorNumber });

            if (existingFloor) {
                const existingSlotNumbers = existingFloor.slots.map(slot => slot.slotNumber);
                const newSlotNumbers = floor.slots.map(slot => parseInt(slot.slotNumber));

                // Filter out new slot numbers that are not already existing
                const newUniqueSlotNumbers = newSlotNumbers.filter(slotNumber => !existingSlotNumbers.includes(slotNumber));

                // Create new slot objects for unique slot numbers
                const newSlotsToAdd = floor.slots.filter(slot => newUniqueSlotNumbers.includes(parseInt(slot.slotNumber)));

                // Add new slots to existing floor
                existingFloor.slots.push(...newSlotsToAdd);

                // Save the modified existing floor document
                await existingFloor.save();
            } else {
                const newFloor = new Floor({
                    floorNumber: floor.floorNumber,
                    slots: floor.slots
                });

                // Save the new floor document
                await newFloor.save();
            }
        }

        // Delete floors not present in the updated floorArray
        const existingFloorNumbers = await Floor.find().distinct('floorNumber');
        const newFloorNumbers = floorArray.map(floor => floor.floorNumber);

        const floorsToDelete = existingFloorNumbers.filter(floorNumber => !newFloorNumbers.includes(floorNumber));
        for (const floorNumber of floorsToDelete) {
            await Floor.deleteOne({ floorNumber });
        }

        // Delete slots not present in the updated floorArray for existing floors
        for (const existingFloorNumber of existingFloorNumbers) {
            const existingFloor = await Floor.findOne({ floorNumber: existingFloorNumber });

            if (existingFloor) {
                const updatedFloor = floorArray.find(floor => floor.floorNumber === existingFloorNumber);

                if (updatedFloor) {
                    const existingSlotNumbers = existingFloor.slots.map(slot => slot.slotNumber);
                    const updatedSlotNumbers = updatedFloor.slots.map(slot => parseInt(slot.slotNumber));

                    const slotsToDelete = existingSlotNumbers.filter(slotNumber => !updatedSlotNumbers.includes(slotNumber));

                    if (slotsToDelete.length > 0) {
                        existingFloor.slots = existingFloor.slots.filter(slot => !slotsToDelete.includes(slot.slotNumber));
                        await existingFloor.save();
                    }
                } else {
                    existingFloor.slots = [];
                    await existingFloor.save();
                }
            }
        }

        return res.status(200).json({ message: 'Parking slot or floor updated successfully' });
    } catch (err) {
        console.log('error:', err);
        return res.status(500).json({ message: 'Server Error', error: err });
    }
}

const getFloorSlotDesign = async (req, res) => {
    try {
        const data = await Floor.find();
        res.status(200).json({ message: 'Data Fetched Successfully', data });
    } catch (error) {
        console.error('Error fetching floors:', error);
        res.status(500).json({ message: 'Failed to fetch floors.' });
    }
}

const deleteSlot = async (req, res) => {
    try {
        const { slotId, floorId } = req.params

        // check is floor available
        const floor = await Floor.findById(floorId)
        if (!floor) {
            return res.sendStatus(404).json({ message: 'Floor not found' });
        }

        // findding index of given slot id
        const slotIndex = floor.slots.findIndex(slot => slot?._id.toString() === slotId)
        if (slotIndex == -1) {
            return res.sendStatus(404).json({ message: 'Slot not found' });
        }

        floor.slots.splice(slotIndex, 1);
        await floor.save();

        return res.sendStatus(200).json({ message: 'Slot deleted successfully' });
    }
    catch (err) {
        res.sendStatus(500).json({ message: 'Server Error' })
    }
}

const deleteFloor = async (req, res) => {
    try {
        const { floorId } = req.params.id
        const deletedFloor = await Floor.findByIdAndDelete(floorId);

        if (!deletedFloor) {
            return res.sendStatus(404).json({ message: 'Floor not found' });
        }

        res.sendStatus(200).json({ message: 'Floor deleted successfully' });
    }
    catch (err) {
        res.sendStatus(500).json({ message: 'Server Error' })
    }
}

export { createFloorAndSlot, updateFloorAndSlot, getFloorSlotDesign, deleteSlot, deleteFloor }
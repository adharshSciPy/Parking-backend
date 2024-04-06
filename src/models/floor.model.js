import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

//nested slot schema
const slotSchema = new Schema({
    slotNumber: {
        type: Number,
        unique: true,
        required: [true, 'Slot number is required']
    },
    isReserved: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    duration: {
        type: String
    },
    date: {
        type: String
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    }
}, { timestamps: true }
)

const floorSchema = new Schema({
    floorNumber: {
        type: Number,
        unique: true,
        required: [true, 'floor number is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    slots: [slotSchema]
})

//slot schema duration pre value calculating
slotSchema.methods.calculateDuration = function (startTime, endTime) {
    const [startHours, startMinutes, startSeconds] = startTime.split(':');
    const [endHours, endMinutes, endSeconds] = endTime.split(':');

    const startTimeMoment = moment().set({ hours: startHours, minutes: startMinutes, seconds: startSeconds });
    const endTimeMoment = moment().set({ hours: endHours, minutes: endMinutes, seconds: endSeconds });

    if (startTimeMoment.isValid() && endTimeMoment.isValid()) {
        const durationInMilliseconds = endTimeMoment.diff(startTimeMoment);

        if (durationInMilliseconds <= 0) {
            return `00 hours 00 minutes`;
        }

        const duration = moment.duration(durationInMilliseconds);
        const hours = duration.hours();
        const minutes = duration.minutes();
        return `${hours} hours ${minutes} minutes`;
    }

    return null;
}



export const Floor = mongoose.model('Floor', floorSchema)

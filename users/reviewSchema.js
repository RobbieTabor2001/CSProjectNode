// reviewSchema.js

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // This should match the name you used in mongoose.model('User', userSchema)
    },
    songId: String,
    reviewText: String,
    userName: String // This field stores the username as plain text
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;

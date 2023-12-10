// songSchema.js
import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    name: String,
    artist: String,
    trackId: { type: String, unique: true, required: true },
    album: String,
    releaseDate: String,
    durationMs: Number,
    previewUrl: String
});

const Song = mongoose.model('Song', songSchema);

export default Song;
